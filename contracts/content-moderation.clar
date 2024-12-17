;; Content Moderation Contract

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-flagged (err u102))

(define-map flagged-content
  { content-id: uint, flagger: principal }
  { reason: (string-utf8 500) }
)

(define-map moderation-votes
  { content-id: uint, moderator: principal }
  { vote: bool }
)

(define-map moderation-results
  { content-id: uint }
  {
    total-votes: uint,
    positive-votes: uint,
    status: (string-ascii 20)
  }
)

(define-public (flag-content (content-id uint) (reason (string-utf8 500)))
  (begin
    (asserts! (is-none (map-get? flagged-content { content-id: content-id, flagger: tx-sender })) err-already-flagged)
    (ok (map-set flagged-content
      { content-id: content-id, flagger: tx-sender }
      { reason: reason }
    ))
  )
)

(define-public (vote-on-content (content-id uint) (vote bool))
  (let
    (
      (current-votes (default-to { total-votes: u0, positive-votes: u0, status: "pending" }
                                 (map-get? moderation-results { content-id: content-id })))
    )
    (asserts! (is-none (map-get? moderation-votes { content-id: content-id, moderator: tx-sender })) (err u403))
    (map-set moderation-votes
      { content-id: content-id, moderator: tx-sender }
      { vote: vote }
    )
    (map-set moderation-results
      { content-id: content-id }
      (merge current-votes {
        total-votes: (+ (get total-votes current-votes) u1),
        positive-votes: (if vote
                          (+ (get positive-votes current-votes) u1)
                          (get positive-votes current-votes))
      })
    )
    (ok true)
  )
)

(define-read-only (get-moderation-result (content-id uint))
  (ok (unwrap! (map-get? moderation-results { content-id: content-id }) (err u404)))
)

(define-public (finalize-moderation (content-id uint))
  (let
    (
      (result (unwrap! (map-get? moderation-results { content-id: content-id }) (err u404)))
      (total-votes (get total-votes result))
      (positive-votes (get positive-votes result))
      (new-status (if (> (* positive-votes u2) total-votes) "approved" "removed"))
    )
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set moderation-results
      { content-id: content-id }
      (merge result { status: new-status })
    ))
  )
)

