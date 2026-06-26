{
  "name": "Category",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "slug": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "image_url": {
      "type": "string"
    },
    "sort_order": {
      "type": "number"
    },
    "active": {
      "type": "boolean"
    },
    "seo_title": {
      "type": "string"
    },
    "seo_description": {
      "type": "string"
    }
  },
  "required": [
    "name",
    "slug"
  ]
}