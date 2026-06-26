{
  "name": "Product",
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
    "short_description": {
      "type": "string"
    },
    "sku": {
      "type": "string"
    },
    "category_id": {
      "type": "string"
    },
    "category_name": {
      "type": "string"
    },
    "price": {
      "type": "number"
    },
    "compare_price": {
      "type": "number"
    },
    "cost_price": {
      "type": "number"
    },
    "stock_qty": {
      "type": "number"
    },
    "low_stock_threshold": {
      "type": "number"
    },
    "track_inventory": {
      "type": "boolean"
    },
    "weight": {
      "type": "number"
    },
    "images": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "attributes": {
      "type": "object"
    },
    "variants": {
      "type": "array",
      "items": {
        "type": "object"
      }
    },
    "active": {
      "type": "boolean"
    },
    "featured": {
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
    "slug",
    "price"
  ]
}