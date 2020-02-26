let db = {
  users: [
    {
      userId: "dfaskd2l33333klkd",
      email: "test@test.com",
      username: "user",
      createdAt: "2020-02-25T18:04:51.601Z",
      imageUrl: "image/aksldjflksajf/sdfass",
      bio: "Hello, this is my bio",
      website: "https://website.com",
      location: "Place, USA"
    }
  ],
  posts: [
    {
      username: "user",
      body: "this is the post body",
      createdAt: "2020-02-25T00:06:03.467Z",
      likeCount: 10,
      commentCount: 5
    }
  ],
  comments: [
    {
      userHandle: "user",
      screamId: "kdjsfgdksuufhgkdsufky",
      body: "nice one mate!",
      createdAt: "2019-03-15T10:59:52.798Z"
    }
  ],
  notifications: [
    {
      recipient: "user",
      sender: "john",
      read: "true | false",
      screamId: "kdjsfgdksuufhgkdsufky",
      type: "like | comment",
      createdAt: "2019-03-15T10:59:52.798Z"
    }
  ]
};

const userDetails = {
  // Redux data
  credentials: {
    userId: "N43KJ5H43KJHREW4J5H3JWMERHB",
    email: "user@email.com",
    handle: "user",
    createdAt: "2019-03-15T10:59:52.798Z",
    imageUrl: "image/dsfsdkfghskdfgs/dgfdhfgdh",
    bio: "Hello, my name is user, nice to meet you",
    website: "https://user.com",
    location: "Lonodn, UK"
  },
  likes: [
    {
      userHandle: "user",
      screamId: "hh7O5oWfWucVzGbHH2pa"
    },
    {
      userHandle: "user",
      screamId: "3IOnFoQexRcofs5OhBXO"
    }
  ]
};
