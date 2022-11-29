import { json } from "stream/consumers";

export const swaggerObject = {
routePrefix: '/documentation',
openapi: {
  info: {
    title: 'Fastify-FormBuilder-API',
    description: 'A Form Builder app, where users can create multiple forms',
    version: '1.0.0',
    termsOfService: 'www.google.co.in',
    contact: {
      name: 'John Doe',
      url:  'www.JohnDoeinfo.com',
      email: 'JohnDoe@umail.com',
    }
  },
  externalDocs: {
    url: 'https://swagger.io',
    description: 'Find more info here'
  },
  servers: [{
    url: 'http://localhost:3000'
  }],
  tags: [ {name: "User", description: "User's Endpoints"}, {name: "Forms", description: "Form's Endpoints"}, {name: "Submission", description: "Submission Endpoint"}],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
    }
  }
},
exposeRoute: true
}
}