/** What the public team link returns. Never includes amounts, phone, email or notes. */
export interface SharedEvent {
  service_type: string
  customer_name: string
  event_date: string
  start_time: string
  end_time: string
  location: string | null
  status: string
  /** IANA timezone of the studio. */
  timezone: string
}

export interface ShareLink {
  url: string
}
