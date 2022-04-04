(namespace 'jbsi)

(module product_identication GOVERNANCE
    ; capability
    (defcap GOVERNANCE()
        (enforce-guard (read-keyset 'admin-keyset))
    )
    (defcap ACTIVITY()
        true)
    
    ; define table schema
    (defschema items
        name: string
        url: string
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
            'status: status,
            'guard: guard
        })
        
        (with-capability (ACTIVITY)
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

        (require-capability (ACTIVITY))
             ; admin or owner only
        (enforce-one "Authorization failed"
            [
                (enforce-guard (read-keyset 'admin-keyset))
                (enforce-guard (at 'guard (read tbl_items item_id)))
            ]
        )

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
            (update tbl_items item_id {"guard": receiver })

            (with-capability (ACTIVITY)
                (create-activity 
                    act_id 
                    item_id 
                    sender 
                    receiver 
                    (format-time "%F" (time "2022-03-29T08:30:00Z")) 
                    'transfer)
            )

            (format "Item {} was successfully transferred from {} to {}" [item_id, sender, receiver])
        )
    )
    
)