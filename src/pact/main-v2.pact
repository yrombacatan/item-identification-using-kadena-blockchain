(define-keyset 'jbsi-admin-keyset)

(module item_identification GOVERNANCE
    ; capability
    (defcap GOVERNANCE()
        (enforce-guard (read-keyset 'jbsi-admin-keyset))
    )

    (defcap ALLOW_ENTRY(item_id)
        (enforce-guard (at "guard" (read tbl_itemsv2 item_id)))
    )

    (defcap ALLOW_GUARD(guard)
        (enforce-guard guard)
    )

    ; define table schema
    (defschema items
        name: string
        url: string
        description: string
        date: string
        activities: list
        guard: guard
    )

    ; new version of table schema
    (defschema itemsv2
        name: string
        url: string
        description: string
        date: string
        activities: list
        guard: guard
    )

    ; define table
    (deftable tbl_itemsv2: {itemsv2})
    
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
        activities:list
        guard:guard
        )

        ; validate input
        (enforce (!= item_id "") "Item id is required")
        (enforce (!= name "") "Item name id is required")
        (enforce (!= url "") "Url is required")

        (with-capability (ALLOW_GUARD guard)
            (tbl-itemsv2-insert 
                item_id 
                name
                url
                description
                date
                activities
                guard)

            (format "Item {} created, Guard: {}" [item_id, guard])
        )
    )

    (defun item-details:object(item_id)
       {"body": (read tbl_itemsv2 item_id), "keys": item_id}
    )

    (defun item-all:list()
        (map (item-details) (keys tbl_itemsv2))
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
            (with-read tbl_itemsv2 item_id {
                "guard":= sender
                }
                
                (tbl-itemsv2-update item_id activities receiver)

                (format "Item {} was successfully transferred from {} to {}" [item_id, sender, receiver])
            )
        )
    )

    (defun tbl-itemsv2-insert (
        item_id:string
        name:string
        url:string
        description:string
        date:string
        activities:list
        guard:guard
        )

        (require-capability (ALLOW_GUARD guard))

        (insert tbl_itemsv2 item_id {
            'name: name,
            'url: url,
            'description: description,
            'date: date,
            'activities: activities,
            'guard: guard
        })
    )

    (defun tbl-itemsv2-update (
        item_id:string
        activities:list
        receiver:guard
        )

        (require-capability (ALLOW_ENTRY item_id))
        (update tbl_itemsv2 item_id {"guard": receiver, "activities": activities})
    )
    
)

(create-table tbl_itemsv2)