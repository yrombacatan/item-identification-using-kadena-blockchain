(module item_identification GOVERNANCE
    ; capability
    (defcap GOVERNANCE()
        (enforce-guard (read-keyset 'jbsi-admin-keyset))
    )

    (defcap ALLOW_ENTRY(item_id)
        (enforce-guard (at "guard" (read tbl_itemsv3 item_id)))
    )

    (defcap ALLOW_USER(user_id)
        (enforce-guard (at "guard" (read tbl_users user_id)))
    )

    (defcap ALLOW_GUARD(guard)
        (enforce-guard guard)
    )

    ; define table schema
    (defschema items
        id:string
        name:string
        url:string
        description:string
        tags:list
        date:string
        activities:list
        guard:guard
    )

    (defschema transactions
        id:string
        from:string
        to:string
        event:string
    )

    (defschema users
        id:string
        image:string
        fname:string
        lname:string
        gender:bool
        guard:guard
    )

    ; define table
    (deftable tbl_itemsv3: {items})
    (deftable tbl_users: {users})

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
        tags: list
        date:string
        activity:list
        guard:guard
        )

        ; validate input
        (enforce (!= item_id "") "Item id is required")
        (enforce (!= name "") "Item name id is required")
        (enforce (!= url "") "Url is required")
        (enforce (!= description "") "Description is required")
        (enforce (!= (length tags) 0) "Tags is required")

        (with-capability (ALLOW_GUARD guard)
            (tbl-items-insert 
                item_id 
                name
                url
                description
                tags
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

    (defun create-user:string(
        user_id:string
        image:string
        fname:string
        lname:string
        gender:bool
        guard:guard
        )

        (insert tbl_users user_id {
            'image: image,
            'fname: fname,
            'lname: lname,
            'gender: gender,
            'guard: guard
        })

        (format "User created")
    )

    (defun update-user:string(
        user_id:string
        image:string
        fname:string
        lname:string
        gender:bool
        )

        (with-capability (ALLOW_USER user_id)
            (tbl-users-update
                user_id
                image
                fname
                lname
                gender)

            (format "User updated")
        )
        
    )

    (defun tbl-items-insert (
        item_id:string
        name:string
        url:string
        description:string
        tags:list
        date:string
        activity:list
        guard:guard
        )

        (require-capability (ALLOW_GUARD guard))

        (insert tbl_itemsv3 item_id {
            'id: item_id,
            'name: name,
            'url: url,
            'description: description,
            'tags: tags,
            'date: date,
            'activities: activity,
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

    (defun tbl-users-update (
        user_id:string
        image:string
        fname:string
        lname:string
        gender:bool
        )
        
        (require-capability (ALLOW_USER user_id))

        (update tbl_users user_id {
            'image: image,
            'fname: fname,
            'lname: lname,
            'gender: gender
        })
    )
    
)

(create-table tbl_itemsv3)
(create-table tbl_users)