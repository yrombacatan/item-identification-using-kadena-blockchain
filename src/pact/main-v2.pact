(define-keyset 'jbsi-admin-keyset)

(module item_identification GOVERNANCE
    ; capability
    (defcap GOVERNANCE()
        (enforce-guard (read-keyset 'jbsi-admin-keyset))
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

        (insert tbl_itemsv2 item_id {
            'name: name,
            'url: url,
            'description: description,
            'date: date,
            'activities: activities,
            'guard: guard
        })

        (format "Item {} created, Guard: {}" [item_id, guard])
    )

    (defun item-details:object(item_id)
       {"body": (read tbl_itemsv2 item_id), "keys": item_id}
    )

    (defun item-all:list()
        (map (item-details) (keys tbl_itemsv2))
    )

    (defun transfer-item:object(
            item_id:string
            date:string
            activities:list
            receiver:guard
        )

        (enforce (!= item_id "") "Item id is required")
        (enforce (!= (length activities) 0) "Activities is required")
        ; owner only
        (with-read tbl_itemsv2 item_id {
            "guard":= sender
            }

            (enforce-guard sender)

            (update tbl_itemsv2 item_id {"guard": receiver, "activities": activities})

            (format "Item {} was successfully transferred from {} to {}" [item_id, sender, receiver])
        )
    )
    
)

(create-table tbl_itemsv2)