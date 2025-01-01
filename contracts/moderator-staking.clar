;; Moderator Staking Contract

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-insufficient-balance (err u102))

(define-fungible-token moderator-token)

(define-map moderator-stakes
  { moderator: principal }
  { stake-amount: uint }
)

(define-constant minimum-stake u1000000) ;; 1 STX

(define-public (stake-tokens (amount uint))
  (let
    (
      (current-stake (default-to { stake-amount: u0 } (map-get? moderator-stakes { moderator: tx-sender })))
    )
    (asserts! (>= amount minimum-stake) err-insufficient-balance)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (try! (ft-mint? moderator-token amount tx-sender))
    (ok (map-set moderator-stakes
      { moderator: tx-sender }
      { stake-amount: (+ (get stake-amount current-stake) amount) }
    ))
  )
)

(define-public (unstake-tokens (amount uint))
  (let
    (
      (current-stake (unwrap! (map-get? moderator-stakes { moderator: tx-sender }) (err u404)))
    )
    (asserts! (>= (get stake-amount current-stake) amount) err-insufficient-balance)
    (try! (ft-burn? moderator-token amount tx-sender))
    (try! (as-contract (stx-transfer? amount tx-sender tx-sender)))
    (ok (map-set moderator-stakes
      { moderator: tx-sender }
      { stake-amount: (- (get stake-amount current-stake) amount) }
    ))
  )
)

(define-read-only (get-moderator-stake (moderator principal))
  (map-get? moderator-stakes { moderator: moderator })
)

