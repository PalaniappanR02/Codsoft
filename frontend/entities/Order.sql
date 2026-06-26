{
  "name": "Order",
  "type": "object",
  "properties": {
    "order_number": {
      "type": "string"
    },
    "customer_name": {
      "type": "string"
    },
    "customer_email": {
      "type": "string"
    },
    "customer_phone": {
      "type": "string"
    },
    "status": {
      "type": "string"
    },
    "payment_status": {
      "type": "string"
    },
    "payment_method": {
      "type": "string"
    },
    "subtotal": {
      "type": "number"
    },
    "discount": {
      "type": "number"
    },
    "shipping_fee": {
      "type": "number"
    },
    "tax": {
      "type": "number"
    },
    "total": {
      "type": "number"
    },
    "coupon_code": {
      "type": "string"
    },
    "shipping_address": {
      "type": "object"
    },
    "items": {
      "type": "array",
      "items": {
        "type": "object"
      }
    },
    "notes": {
      "type": "string"
    },
    "tracking_number": {
      "type": "string"
    }
  },
  "required": [
    "order_number",
    "customer_name",
    "customer_phone",
    "total",
    "status"
  ]
}