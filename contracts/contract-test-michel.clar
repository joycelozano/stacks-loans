
(define-fungible-token stacks-loans u1)
(define-fungible-token hodl-stacks-loans u1)




(define-public (transfer (recipient principal) (amount uint))
   (match (ft-transfer? stacks-loans amount tx-sender recipient)
    result (ok true)
    error (err false))
)

(define-public (hodl (amount uint))
  (begin
    (unwrap-panic (ft-transfer? stacks-loans amount tx-sender (as-contract tx-sender)))
    (let ((original-sender tx-sender))
     (ok (unwrap-panic (as-contract (ft-transfer? hodl-stacks-loans amount tx-sender original-sender))))
    )
  )
)

(define-public (unhodl (amount uint))
  (begin
    (print (ft-transfer? hodl-stacks-loans amount tx-sender (as-contract tx-sender)))
    (let ((original-sender tx-sender))
      (print (as-contract (ft-transfer? stacks-loans amount tx-sender original-sender)))
    )
  )
)

(define-read-only (balance-of (owner principal))
   (+ (ft-get-balance stacks-loans owner) (ft-get-balance hodl-stacks-loans owner))
)

(define-read-only (hodl-balance-of (owner principal))
  (ft-get-balance hodl-stacks-loans owner)
)

(define-read-only (spendable-balance-of (owner principal))
  (ft-get-balance stacks-loans owner)
)

(define-read-only (get-spendable-in-bank)
  (ft-get-balance stacks-loans (as-contract tx-sender))
)

(define-read-only (get-hodl-in-bank)
  (ft-get-balance hodl-stacks-loans (as-contract tx-sender))
)


(define-private (mint (account principal) (amount uint))
    (begin
      (unwrap-panic (ft-mint? stacks-loans amount account))
      (unwrap-panic (ft-mint? hodl-stacks-loans amount (as-contract tx-sender)))
      (ok amount)))

(define-public (buy-tokens (amount uint))
  (begin
    (unwrap-panic (stx-transfer? amount tx-sender 'ST2R1XSFXYHCSFE426HP45TTD8ZWV9XHX2SRP3XA8))
    (mint tx-sender amount)
  )
)

(begin
  (mint 'ST2R1XSFXYHCSFE426HP45TTD8ZWV9XHX2SRP3XA8 u2)
)