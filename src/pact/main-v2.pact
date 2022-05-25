(define-keyset 'jbsi-admin-keyset)

(module item_identification GOVERNANCE
    ; capability
    (defcap GOVERNANCE()
        (enforce-guard (read-keyset 'jbsi-admin-keyset))
    )

    (defcap ALLOW_ENTRY(item_id)
        (enforce-guard (at "guard" (read tbl_itemsv3 item_id)))
    )

    (defcap ALLOW_GUARD(guard)
        (enforce-guard guard)
    )

    ; define table schema
    (defschema items
        id: string
        name: string
        url: string
        description: string
        date: string
        activities: list
        guard: guard
    )

    ; define table
    (deftable tbl_itemsv3: {items})
    
    ; main logic
    ; function
    (defun welcome-message()
        (format "Welcome to JSBI Product Indentification Smart Contract!" [])
    )

    (defun create-item:object(
        item_id:string
        name:string
        url:string
        description:string
        date:string
        activity:object
        guard:guard
        )

        ; validate input
        (enforce (!= item_id "") "Item id is required")
        (enforce (!= name "") "Item name id is required")
        (enforce (!= url "") "Url is required")

        (with-capability (ALLOW_GUARD guard)
            (tbl-items-insert 
                item_id 
                name
                url
                description
                date
                activity
                guard)

            (format "Item {} created, Guard: {}" [item_id, guard])
        )
    )

    (defun item-details:list(item_id)
        (select tbl_itemsv3 (where 'id (= item_id)))
    )

    (defun item-all:list()
        (select tbl_itemsv3 (constantly true))
    )

    (defun item-all-by-guard:list(guard)
        (select tbl_itemsv3 (where 'guard (= guard)))
    )

    (defun transfer-item:object(
        item_id:string
        activities:list
        receiver:guard
        )

        (enforce (!= item_id "") "Item id is required")
        (enforce (!= (length activities) 0) "Activities is required")
        
        ; owner only
        (with-capability (ALLOW_ENTRY item_id)
            (with-read tbl_itemsv3 item_id {
                "guard":= sender
                }
                
                (tbl-items-update 
                    item_id 
                    activities 
                    receiver)

                (format "Item {} was successfully transferred from {} to {}" [item_id, sender, receiver])
            )
        )
    )

    (defun tbl-items-insert (
        item_id:string
        name:string
        url:string
        description:string
        date:string
        activity:object
        guard:guard
        )

        (require-capability (ALLOW_GUARD guard))

        (insert tbl_itemsv3 item_id {
            'id: item_id,
            'name: name,
            'url: url,
            'description: description,
            'date: date,
            'activities: [activity],
            'guard: guard
        })
    )

    (defun tbl-items-update (
        item_id:string
        activities:list
        receiver:guard
        )

        (require-capability (ALLOW_ENTRY item_id))

        (update tbl_itemsv3 item_id {
            'guard: receiver, 
            'activities: activities
        })
    )
    
)

(create-table tbl_itemsv3)