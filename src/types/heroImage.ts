export interface HeroImage {
  id: number | string
  image_url: string
  title?: string | null
  subtitle?: string | null
  alt_text?: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HeroImageFields {
  title: string
  subtitle: string
  alt_text: string
  display_order: number
  is_active: boolean
}

export interface ReorderItem {
  id: HeroImage['id']
  display_order: number
}
