{
  "name": "Review",
  "type": "object",
  "properties": {
    "product_id": {
      "type": "string"
    },
    "product_name": {
      "type": "string"
    },
    "customer_name": {
      "type": "string"
    },
    "customer_email": {
      "type": "string"
    },
    "rating": {
      "type": "number"
    },
    "title": {
      "type": "string"
    },
    "body": {
      "type": "string"
    },
    "status": {
      "type": "string"
    }
  },
  "required": [
    "product_id",
    "customer_name",
    "rating"
  ]
}