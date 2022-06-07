(define-keyset 'admin-keyset)
(define-keyset 'user-keyset)

(define-namespace 'jbsi
    (keyset-ref-guard 'admin-keyset)
    (keyset-ref-guard 'user-keyset))