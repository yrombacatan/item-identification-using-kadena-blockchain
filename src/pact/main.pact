(define-keyset 'admin-keyset)
(define-keyset 'user-keyset)

(define-namespace 'jbsi
    (keyset-ref-guard 'admin-keyset)
    (keyset-ref-guard 'user-keyset))

(namespace 'jbsi)

(module product_identification GOVERNANCE
    ; capability
    (defcap GOVERNANCE()
        (enforce-guard (read-keyset 'admin-keyset))
    )
    (defcap ALLOW_ENTRY(item_id)
       (enforce-guard (at 'guard (read tbl_items item_id))))
    
    ; define table schema
    (defschema items
        name: string
        url: string
        description: string
        date: string
        status: bool
        guard: guard
    )
    (defschema activities
        item_id: string
        from: guard
        to: guard
        date: string
        event: string
    )

    ; define table
    (deftable tbl_items: {items})
    (deftable tbl_activities: {activities})

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
        status:bool
        guard:guard
        act_id:string
        )

        ; validate input
        (enforce (!= item_id "") "Item id is required")
        (enforce (!= name "") "Item name id is required")
        (enforce (!= url "") "Url is required")
        (enforce (!= status "") "Status is required")

        (insert tbl_items item_id {
            'name: name,
            'url: url,
            'description: description,
            'date: date,
            'status: status,
            'guard: guard
        })
        
        (with-capability (ALLOW_ENTRY item_id)
                (create-activity 
                    act_id 
                    item_id 
                    guard 
                    guard
                    (format-time "%F" (time "2022-03-29T08:30:00Z")) 
                    'creation)
            )

        (format "Item {} created, Guard: {}" [item_id, guard])
    )

    (defun item-details:object(item_id)
        (read tbl_items item_id)
    )

    (defun item-all:list()
        (map (item-details) (keys tbl_items))
    )

    (defun create-activity:object(
        act_id:string
        item_id:string
        sender:guard
        receiver:guard
        date:string
        event:string
        )

        (require-capability (ALLOW_ENTRY item_id))

        (insert tbl_activities act_id {
            'item_id: item_id,
            'from: sender,
            'to: receiver,
            'date: date,
            'event: event
            })

    )

    (defun activity-details:object(act_id)
        (read tbl_activities act_id)
    )

    (defun transfer-item:object(
            item_id:string
            act_id:string
            receiver:guard
        )

        (enforce (!= item_id "") "Item id is required")
        (enforce (!= act_id "") "Activity id is required")
        ; owner only
        (with-read tbl_items item_id {
            "name":= name,
            "guard":= sender
            }

            (enforce-guard sender)
            (with-capability (ALLOW_ENTRY item_id)
                (create-activity 
                    act_id 
                    item_id 
                    sender 
                    receiver 
                    (format-time "%F" (time "2022-03-29T08:30:00Z")) 
                    'transfer)
            )

            (update tbl_items item_id {"guard": receiver })

            (format "Item {} was successfully transferred from {} to {}" [item_id, sender, receiver])
        )
    )
    
)

(create-table tbl_items)
(create-table tbl_activities)