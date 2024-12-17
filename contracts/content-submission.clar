;; Content Submission Contract

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))

(define-data-var content-id-nonce uint u0)

(define-map contents
  { content-id: uint }
  {
    author: principal,
    content-hash: (buff 32),
    timestamp: uint,
    status: (string-ascii 20)
  }
)

(define-public (submit-content (content-hash (buff 32)))
  (let
    (
      (content-id (+ (var-get content-id-nonce) u1))
    )
    (map-set contents
      { content-id: content-id }
      {
        author: tx-sender,
        content-hash: content-hash,
        timestamp: block-height,
        status: "active"
      }
    )
    (var-set content-id-nonce content-id)
    (ok content-id)
  )
)

(define-read-only (get-content (content-id uint))
  (ok (unwrap! (map-get? contents { content-id: content-id }) (err u404)))
)

(define-public (update-content-status (content-id uint) (new-status (string-ascii 20)))
  (let
    (
      (content (unwrap! (map-get? contents { content-id: content-id }) (err u404)))
    )
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set contents
      { content-id: content-id }
      (merge content { status: new-status })
    ))
  )
)

