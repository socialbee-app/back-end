const admin = require("firebase-admin");

const serviceAccount = {
  type: "service_account",
  project_id: "social-bee-12b83",
  private_key_id: "ff9cef1d3c8879b32f04b4e4c30fd06dbce43727",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC3O7pEiCeQ2ne4\nS0UFqf9j3s4V3wPLfvD1Tzqjo9kg9jrUOXIL7tX/xni50rW2+E2kvDqrggGKe06C\nt5UHWjIMecfIZub4Sv3NcowQnO1ryLIFyX6HGft7Ga8lCMsb8RC5w7x4MUPtQDYt\n655cLZYm9ygaoc/YlsVcO11wrI5i+KuXu1bviB+n+e9StvUDNm9nl5viYhFhy9lV\nvT00NsrUa7My5OAjCf8Z4w09AZJdCHiYErt5Z4Gh6c0LGNzYwOmaunURv4K1Mkoi\nGV6fDp+EezeBhi1QhMUFxvhFUrpBeRks/UII+BJrqmQqjUpe6cmwASxjVsrZC3QV\nWdRnWl/VAgMBAAECggEAIUwn0ctiUUb6KZH4FYrqf7YeAkh4MpM7a4C92b3tN7m3\nQBi+Wl/JIMVq6+3YGsttpKmWCdPCvu0ge82rtd3UqYK55PeaMnXCQIL35A74cDVU\n8ItIxHlaw2iL9PFvo4C/ttpUlgzx2JvqHJcsPHkGR8dzUL+l+yiO7e9V0CNzbpWN\nkRzJPBeLc1W2olSMxVWw3phLFDAhhkhgtaDHNkdsAjBOoNKvMSs5jeZV+UncYAOR\n8yhjbCJg7xxP7/P7Qq9ac5KVqm2JWWzY6FhGwZYOzjbq+94gPSoM+ol6KnW0rtWX\ncNt0jZsOHhqREEt2hNaiFlQ8PNwD7m4/ye3vZUc20wKBgQD2GFMWF17IbYJc3PXH\nLT5UoBc2u2FMjLhJqqr4A451WZtgtArmYc6ji31zaUOp76ahTetP2nQuKmqWw/5x\n/12Z2WUHFCZ2halKTqreM8wB9btXV7Z/mCopQY+Qy6gvrWKM9j4yMkCjmMjLDwJf\nRTsgwiy8a7P1xW5FZk4tq4Q37wKBgQC+m7LKwwPECnmX5bst/R+6ITAS24GpZ+91\ns5229BdcySsqepwyhwYkECVPjAPcf/+YyWkWVlUYuxAD2r8UIgpDg+ChCAIOwVWj\nuXuRlgeG3QJ22dtIqe9dV4EQkg42bwYmyegIu7HGWYvWoWpr1z9QqKaLDK93JIbr\nSq2wDuSAewKBgHe2DXTJmYnV+3xA4C4rjA6OcbxmGkaqjVsIcnKDCGF9XWAFNOgs\n2+Aikrv5kLixo1UEGluV4L40U/VTEgtSNa4JWmO/IZa2HkvPSL8eYzbw2lj6igQ3\neQrooXXGG+JVbYM0pby1RUxPnh1pB7ZgbwrYafqeScRcbe/EfHMq4/5xAoGAbheF\n/EEJQsj+FDL3mwdxtNMIbkvkp1FF6QjWll6Dw+7ZhM6Ou0xrypacxkZL0KcJnVjv\n3pv8yKz7Ag7tgJZssTRRoRD8B0O50DgI3Dz4mfe7PaR1WJH2lEY/YK/Lj7supWbH\nI4wtkTAVaeGPkzwe8NqIXxXznvA1EV/v1Bm191MCgYEA5exOP6FfVFc5YGuHGnyr\nL2A4nHoEvh/G+hGkF3L17mAjqCsqRZsp7ssfB7u4EkAYXW2ZNi7m3norh4clDHJK\nGItaPeAIRqJREcKnd1c+9rOzOjOUCSIeFc9xBBfR5TSz6pogcNv/JdCBIGMreCmB\n3B7cHAndMJG1sMaoTzNS+uw=\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-d9ya0@social-bee-12b83.iam.gserviceaccount.com",
  client_id: "103497758532669313180",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-d9ya0%40social-bee-12b83.iam.gserviceaccount.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-bee-12b83.firebaseio.com"
});

const db = admin.firestore();

module.exports = { admin, db };
