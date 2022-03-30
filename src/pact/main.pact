(namespace 'jbsi)

(module product_identication GOVERNANCE
    ; capability
    (defcap GOVERNANCE()
        (enforce-guard (read-keyset 'admin-keyset))
    )
    (defcap ACTIVITY()
        true)
    
    ; define table schema
    (defschema users
        fname: string
        lname: string
        mname: string
        age: integer
        status: bool
        guard: guard
    )
    (defschema documents
        name: string
        url: string
        status: bool
        guard: guard
    )
    (defschema activities
        doc_id: string
        from: guard
        to: guard
        date: string
    )

    ; define table
    (deftable tbl_user: {users})
    (deftable tbl_docs: {documents})
    (deftable tbl_activities: {activities})

    ; main logic
    ; function
    (defun welcome-message()
        (format "Welcome to JSBI Product Indentification Smart Contract!" [])
    )
    
    (defun create-user:object(
        user_id:string
        fname:string
        lname:string
        mname:string
        age:integer
        status:bool
        guard:guard
        )
        
        ; only admin is allowed to create user
        (enforce-guard (read-keyset 'admin-keyset))

        ; validate input
        (enforce (!= user_id "") "User id is required")
        (enforce (!= fname "") "First Name id is required")
        (enforce (!= lname "") "Last Name is required")
        (enforce (!= mname "") "Middle Name id is required")

        (insert tbl_user user_id {
            'fname: fname,
            'lname: lname,
            'mname: mname,
            'age: age,
            'status: status,
            'guard: guard
        })
        
        (format "User {} created, Guard: {}" [user_id, guard])
    )

    (defun user-details:object(user_id)
        (read tbl_user user_id)
    )

    (defun create-document:object(
        document_id:string
        name:string
        url:string
        status:bool
        guard:guard
        )

        ; only admin is allowed to create user
        (enforce-guard (read-keyset 'admin-keyset))

        ; validate input
        (enforce (!= document_id "") "Document id is required")
        (enforce (!= name "") "Document name id is required")
        (enforce (!= url "") "Url is required")
        (enforce (!= status "") "Status is required")

        (insert tbl_docs document_id {
            'name: name,
            'url: url,
            'status: status,
            'guard: guard
        })
        
        (format "Documents {} created, Guard: {}" [document_id, guard])
    )

    (defun document-details:object(documents_id)
        ; admin or owner only
        (enforce-one "Authorization failed"
            [
                (enforce-guard (read-keyset 'admin-keyset))
                (enforce-guard (at 'guard (read tbl_docs documents_id)))
            ]
        )
        (read tbl_docs documents_id)
    )

    (defun create-activity:object(
        act_id:string
        doc_id:string
        sender:guard
        receiver:guard
        date:string
        )

        (require-capability (ACTIVITY))
             ; admin or owner only
        (enforce-one "Authorization failed"
            [
                (enforce-guard (read-keyset 'admin-keyset))
                (enforce-guard (at 'guard (read tbl_docs doc_id)))
            ]
        )

        (insert tbl_activities act_id {
            'doc_id: doc_id,
            'from: sender,
            'to: receiver,
            'date: date
            })

    )

    (defun activity-details:object(act_id)
        (read tbl_activities act_id)
    )

    (defun transfer-document:object(
            doc_id:string
            act_id:string
            receiver:guard
        )

        (enforce (!= doc_id "") "Document id is required")
        (enforce (!= act_id "") "Activity id is required")
        ; owner only
        (with-read tbl_docs doc_id {
            "name":= name,
            "guard":= sender
            }

            (enforce-guard sender)
            (update tbl_docs doc_id {"guard": receiver })

            (with-capability (ACTIVITY)
                (create-activity act_id doc_id sender receiver (format-time "%F" (time "2022-03-29T08:30:00Z")))
            )

            (format "Document {} was successfully transferred from {} to {}" [doc_id, sender, receiver])
        )
    )
    
)