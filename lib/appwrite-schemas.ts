export const DOCTORS_SCHEMA = {
  collectionId: 'doctors',
  attributes: [
    // Text attribute: name
    {
      key: 'name',
      type: 'string',
      required: true,
      encrypt: false,
    },
    // Text attribute: specialty
    {
      key: 'specialty',
      type: 'string',
      required: true,
      encrypt: false,
    },
    // Numeric attribute: hourlyRate
    {
      key: 'hourlyRate',
      type: 'integer',
      required: true,
      min: 0,
    },
    // Text attribute: image
    {
      key: 'image',
      type: 'string',
      required: false,
    },
    // Text attribute: experience
    {
      key: 'experience',
      type: 'string',
      required: false,
    },
    // JSON attribute: specialties (array)
    {
      key: 'specialties',
      type: 'string', // Store as JSON string
      required: false,
    },
    // Text attribute: createdAt
    {
      key: 'createdAt',
      type: 'string',
      required: true,
    },
    // Text attribute: updatedAt
    {
      key: 'updatedAt',
      type: 'string',
      required: true,
    },
  ],
};

export const TIME_SLOTS_SCHEMA = {
  collectionId: 'timeSlots',
  attributes: [
    // Text attribute: doctorId
    {
      key: 'doctorId',
      type: 'string',
      required: true,
    },
    // Text attribute: time
    {
      key: 'time',
      type: 'string',
      required: true,
    },
    // Boolean attribute: available
    {
      key: 'available',
      type: 'boolean',
      required: true,
    },
    // Text attribute: status
    {
      key: 'status',
      type: 'string',
      required: true,
    },
    // Text attribute: label
    {
      key: 'label',
      type: 'string',
      required: true,
    },
    // Text attribute: date (for filtering by date)
    {
      key: 'date',
      type: 'string',
      required: true,
    },
  ],
};

export const USERS_SCHEMA = {
  collectionId: 'users_data',
  attributes: [
    // Text attribute: email
    {
      key: 'email',
      type: 'string',
      required: true,
    },
    // Text attribute: name
    {
      key: 'name',
      type: 'string',
      required: true,
    },
    // Text attribute: role
    {
      key: 'role',
      type: 'string',
      required: false,
    },
    // Text attribute: phone
    {
      key: 'phone',
      type: 'string',
      required: false,
    },
    // Text attribute: createdAt
    {
      key: 'createdAt',
      type: 'string',
      required: true,
    },
  ],
};
