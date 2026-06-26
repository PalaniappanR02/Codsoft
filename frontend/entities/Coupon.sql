{
  "name": "Coupon",
  "type": "object",
  "properties": {
    "code": {
      "type": "string"
    },
    "type": {
      "type": "string"
    },
    "value": {
      "type": "number"
    },
    "min_order": {
      "type": "number"
    },
    "max_uses": {
      "type": "number"
    },
    "used_count": {
      "type": "number"
    },
    "max_uses_per_user": {
      "type": "number"
    },
    "starts_at": {
      "type": "string"
    },
    "expires_at": {
      "type": "string"
    },
    "active": {
      "type": "boolean"
    },
    "description": {
      "type": "string"
    }
  },
  "required": [
    "code",
    "type"
  ]
}