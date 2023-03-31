/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute, HttpStatusCodeLiteral, TsoaResponse, fetchMiddlewares } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CompanyController } from './controllers/CompanyController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ContactController } from './controllers/ContactController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ContractController } from './controllers/ContractController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { InvoiceController } from './controllers/InvoiceController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ProductCategoryController } from './controllers/ProductCategoryController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ProductController } from './controllers/ProductController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { RoleController } from './controllers/RoleController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { RootController } from './controllers/RootController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserController } from './controllers/UserController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { VATController } from './controllers/VATController';
import { expressAuthentication } from './auth/authentication';
// @ts-ignore - no great way to install types from subpackage
const promiseAny = require('promise.any');
import type { RequestHandler, Router } from 'express';

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "CompanyStatus": {
        "dataType": "refEnum",
        "enums": ["ACTIVE","INACTIVE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Company": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "addressStreet": {"dataType":"string","required":true},
            "addressPostalCode": {"dataType":"string","required":true},
            "addressCity": {"dataType":"string","required":true},
            "addressCountry": {"dataType":"string","required":true},
            "invoiceAddressStreet": {"dataType":"string","required":true},
            "invoiceAddressPostalCode": {"dataType":"string","required":true},
            "invoiceAddressCity": {"dataType":"string","required":true},
            "invoiceAddressCountry": {"dataType":"string","required":true},
            "status": {"ref":"CompanyStatus","required":true},
            "phoneNumber": {"dataType":"string"},
            "logoFilename": {"dataType":"string","required":true},
            "comments": {"dataType":"string"},
            "contracts": {"dataType":"array","array":{"dataType":"refObject","ref":"Contract"},"required":true},
            "invoices": {"dataType":"array","array":{"dataType":"refObject","ref":"Invoice"},"required":true},
            "contacts": {"dataType":"array","array":{"dataType":"refObject","ref":"Contact"},"required":true},
            "activities": {"dataType":"array","array":{"dataType":"refObject","ref":"CompanyActivity"},"required":true},
            "files": {"dataType":"array","array":{"dataType":"refObject","ref":"CompanyFile"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductStatus": {
        "dataType": "refEnum",
        "enums": ["ACTIVE","INACTIVE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VAT": {
        "dataType": "refEnum",
        "enums": ["ZERO","LOW","HIGH"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Product": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "nameDutch": {"dataType":"string","required":true},
            "nameEnglish": {"dataType":"string","required":true},
            "targetPrice": {"dataType":"double","required":true},
            "status": {"ref":"ProductStatus","required":true},
            "description": {"dataType":"string","required":true},
            "contractTextDutch": {"dataType":"string","required":true},
            "contractTextEnglish": {"dataType":"string","required":true},
            "deliverySpecificationDutch": {"dataType":"string"},
            "deliverySpecificationEnglish": {"dataType":"string"},
            "vatId": {"dataType":"double","required":true},
            "categoryId": {"dataType":"double","required":true},
            "minTarget": {"dataType":"double","required":true},
            "maxTarget": {"dataType":"double","required":true},
            "valueAddedTax": {"ref":"ValueAddedTax","required":true},
            "category": {"ref":"ProductCategory","required":true},
            "instances": {"dataType":"array","array":{"dataType":"refObject","ref":"ProductInstance"},"required":true},
            "activities": {"dataType":"array","array":{"dataType":"refObject","ref":"ProductActivity"},"required":true},
            "files": {"dataType":"array","array":{"dataType":"refObject","ref":"ProductFile"},"required":true},
            "pricing": {"ref":"ProductPricing"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ValueAddedTax": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "category": {"ref":"VAT","required":true},
            "amount": {"dataType":"double","required":true},
            "products": {"dataType":"array","array":{"dataType":"refObject","ref":"Product"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductCategory": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "products": {"dataType":"array","array":{"dataType":"refObject","ref":"Product"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductInstance": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "productId": {"dataType":"double","required":true},
            "product": {"ref":"Product","required":true},
            "contractId": {"dataType":"double","required":true},
            "contract": {"ref":"Contract","required":true},
            "invoiceId": {"dataType":"double"},
            "invoice": {"ref":"Invoice"},
            "activities": {"dataType":"array","array":{"dataType":"refObject","ref":"ProductInstanceActivity"},"required":true},
            "basePrice": {"dataType":"double","required":true},
            "discount": {"dataType":"double","required":true},
            "details": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ActivityType": {
        "dataType": "refEnum",
        "enums": ["STATUS","COMMENT","EDIT","REASSIGN","ADDPRODUCT","DELPRODUCT"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Gender": {
        "dataType": "refEnum",
        "enums": ["MALE","FEMALE","OTHER","UNKNOWN"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "User": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "gender": {"ref":"Gender","required":true},
            "firstName": {"dataType":"string","required":true},
            "lastNamePreposition": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "replyToEmail": {"dataType":"string","required":true},
            "comment": {"dataType":"string","required":true},
            "function": {"dataType":"string","required":true},
            "avatarFilename": {"dataType":"string","required":true},
            "backgroundFilename": {"dataType":"string","required":true},
            "receiveEmails": {"dataType":"boolean","required":true},
            "sendEmailsToReplyToEmail": {"dataType":"boolean","required":true},
            "roles": {"dataType":"array","array":{"dataType":"refObject","ref":"Role"},"required":true},
            "identityLocal": {"ref":"IdentityLocal"},
            "identityLdap": {"ref":"IdentityLDAP"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Role": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "ldapGroup": {"dataType":"string","required":true},
            "users": {"dataType":"array","array":{"dataType":"refObject","ref":"User"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IdentityLocal": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "verifiedEmail": {"dataType":"boolean","required":true},
            "salt": {"dataType":"string"},
            "hash": {"dataType":"string"},
            "lastLogin": {"dataType":"datetime"},
            "user": {"ref":"User","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IdentityLDAP": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "username": {"dataType":"string","required":true},
            "overrideEmail": {"dataType":"boolean","required":true},
            "lastLogin": {"dataType":"datetime"},
            "user": {"ref":"User","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductActivity": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "type": {"ref":"ActivityType","required":true},
            "descriptionEnglish": {"dataType":"string","required":true},
            "descriptionDutch": {"dataType":"string","required":true},
            "createdById": {"dataType":"double","required":true},
            "createdBy": {"ref":"User","required":true},
            "productId": {"dataType":"double","required":true},
            "product": {"ref":"Product","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductFile": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "downloadName": {"dataType":"string","required":true},
            "location": {"dataType":"string","required":true},
            "createdById": {"dataType":"double","required":true},
            "createdBy": {"ref":"User","required":true},
            "productId": {"dataType":"double","required":true},
            "product": {"ref":"Product","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductPricing": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "description": {"dataType":"string","required":true},
            "data": {"dataType":"array","array":{"dataType":"array","array":{"dataType":"string"}},"required":true},
            "product": {"ref":"Product","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Contract": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "title": {"dataType":"string","required":true},
            "companyId": {"dataType":"double","required":true},
            "company": {"ref":"Company","required":true},
            "products": {"dataType":"array","array":{"dataType":"refObject","ref":"ProductInstance"},"required":true},
            "createdById": {"dataType":"double","required":true},
            "createdBy": {"ref":"User","required":true},
            "assignedToId": {"dataType":"double","required":true},
            "assignedTo": {"ref":"User","required":true},
            "contactId": {"dataType":"double","required":true},
            "comments": {"dataType":"string"},
            "contact": {"ref":"Contact","required":true},
            "activities": {"dataType":"array","array":{"dataType":"refObject","ref":"ContractActivity"},"required":true},
            "files": {"dataType":"array","array":{"dataType":"refObject","ref":"ContractFile"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Invoice": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "products": {"dataType":"array","array":{"dataType":"refObject","ref":"ProductInstance"},"required":true},
            "title": {"dataType":"string","required":true},
            "poNumber": {"dataType":"string"},
            "startDate": {"dataType":"datetime","required":true},
            "companyId": {"dataType":"double","required":true},
            "createdById": {"dataType":"double","required":true},
            "createdBy": {"ref":"User","required":true},
            "assignedToId": {"dataType":"double","required":true},
            "assignedTo": {"ref":"User","required":true},
            "comments": {"dataType":"string"},
            "company": {"ref":"Company","required":true},
            "activities": {"dataType":"array","array":{"dataType":"refObject","ref":"InvoiceActivity"},"required":true},
            "files": {"dataType":"array","array":{"dataType":"refObject","ref":"InvoiceFile"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InvoiceStatus": {
        "dataType": "refEnum",
        "enums": ["CREATED","PROPOSED","SENT","PAID","IRRECOVERABLE","CANCELLED"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InvoiceActivity": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "type": {"ref":"ActivityType","required":true},
            "descriptionEnglish": {"dataType":"string","required":true},
            "descriptionDutch": {"dataType":"string","required":true},
            "createdById": {"dataType":"double","required":true},
            "createdBy": {"ref":"User","required":true},
            "invoiceId": {"dataType":"double","required":true},
            "invoice": {"ref":"Invoice","required":true},
            "subType": {"ref":"InvoiceStatus"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InvoiceFile": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "downloadName": {"dataType":"string","required":true},
            "location": {"dataType":"string","required":true},
            "createdById": {"dataType":"double","required":true},
            "createdBy": {"ref":"User","required":true},
            "invoiceId": {"dataType":"double","required":true},
            "invoice": {"ref":"Invoice","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductInstanceStatus": {
        "dataType": "refEnum",
        "enums": ["NOTDELIVERED","DELIVERED","CANCELLED","DEFERRED"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductInstanceActivity": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "type": {"ref":"ActivityType","required":true},
            "descriptionEnglish": {"dataType":"string","required":true},
            "descriptionDutch": {"dataType":"string","required":true},
            "createdById": {"dataType":"double","required":true},
            "createdBy": {"ref":"User","required":true},
            "productInstanceId": {"dataType":"double","required":true},
            "productInstance": {"ref":"ProductInstance","required":true},
            "subType": {"ref":"ProductInstanceStatus"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContactFunction": {
        "dataType": "refEnum",
        "enums": ["NORMAL","PRIMARY","FINANCIAL","OLD"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Contact": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "gender": {"ref":"Gender","required":true},
            "firstName": {"dataType":"string","required":true},
            "lastNamePreposition": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "telephone": {"dataType":"string","required":true},
            "comments": {"dataType":"string","required":true},
            "function": {"ref":"ContactFunction","required":true},
            "companyId": {"dataType":"double","required":true},
            "company": {"ref":"Company","required":true},
            "contracts": {"dataType":"array","array":{"dataType":"refObject","ref":"Contract"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContractStatus": {
        "dataType": "refEnum",
        "enums": ["CREATED","PROPOSED","SENT","CONFIRMED","FINISHED","CANCELLED"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContractActivity": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "type": {"ref":"ActivityType","required":true},
            "descriptionEnglish": {"dataType":"string","required":true},
            "descriptionDutch": {"dataType":"string","required":true},
            "createdById": {"dataType":"double","required":true},
            "createdBy": {"ref":"User","required":true},
            "contractId": {"dataType":"double","required":true},
            "contract": {"ref":"Contract","required":true},
            "subType": {"ref":"ContractStatus"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContractFile": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "downloadName": {"dataType":"string","required":true},
            "location": {"dataType":"string","required":true},
            "createdById": {"dataType":"double","required":true},
            "createdBy": {"ref":"User","required":true},
            "contractId": {"dataType":"double","required":true},
            "contract": {"ref":"Contract","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CompanyActivity": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "type": {"ref":"ActivityType","required":true},
            "descriptionEnglish": {"dataType":"string","required":true},
            "descriptionDutch": {"dataType":"string","required":true},
            "createdById": {"dataType":"double","required":true},
            "createdBy": {"ref":"User","required":true},
            "companyId": {"dataType":"double","required":true},
            "company": {"ref":"Company","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CompanyFile": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "downloadName": {"dataType":"string","required":true},
            "location": {"dataType":"string","required":true},
            "createdById": {"dataType":"double","required":true},
            "createdBy": {"ref":"User","required":true},
            "companyId": {"dataType":"double","required":true},
            "company": {"ref":"Company","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CompanyListResponse": {
        "dataType": "refObject",
        "properties": {
            "list": {"dataType":"array","array":{"dataType":"refObject","ref":"Company"},"required":true},
            "count": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiError": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "stack": {"dataType":"string"},
            "statusCode": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "WrappedApiError": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"error":{"ref":"ApiError","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SortDirection": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["ASC"]},{"dataType":"enum","enums":["DESC"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ListSorting": {
        "dataType": "refObject",
        "properties": {
            "column": {"dataType":"string","required":true},
            "direction": {"ref":"SortDirection","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ListOrFilter": {
        "dataType": "refObject",
        "properties": {
            "column": {"dataType":"string","required":true},
            "values": {"dataType":"array","array":{"dataType":"any"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ListParams": {
        "dataType": "refObject",
        "properties": {
            "skip": {"dataType":"double"},
            "take": {"dataType":"double"},
            "sorting": {"ref":"ListSorting"},
            "search": {"dataType":"string"},
            "filters": {"dataType":"array","array":{"dataType":"refObject","ref":"ListOrFilter"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CompanySummary": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "logoFilename": {"dataType":"string","required":true},
            "status": {"ref":"CompanyStatus","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ETProductInstance": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "productId": {"dataType":"double","required":true},
            "details": {"dataType":"string"},
            "basePrice": {"dataType":"double","required":true},
            "discount": {"dataType":"double","required":true},
            "subType": {"ref":"ProductInstanceStatus","required":true},
            "invoiceDate": {"dataType":"datetime"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ETContract": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "title": {"dataType":"string","required":true},
            "subType": {"ref":"ContractStatus","required":true},
            "products": {"dataType":"array","array":{"dataType":"refObject","ref":"ETProductInstance"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ETCompany": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "contracts": {"dataType":"array","array":{"dataType":"refObject","ref":"ETContract"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ETCompanyListResponse": {
        "dataType": "refObject",
        "properties": {
            "list": {"dataType":"array","array":{"dataType":"refObject","ref":"ETCompany"},"required":true},
            "count": {"dataType":"double","required":true},
            "extra": {"dataType":"nestedObjectLiteral","nestedProperties":{"nrOfProducts":{"dataType":"double","required":true},"sumProducts":{"dataType":"double","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CompanyParams": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "comments": {"dataType":"string"},
            "phoneNumber": {"dataType":"string"},
            "addressStreet": {"dataType":"string","required":true},
            "addressPostalCode": {"dataType":"string","required":true},
            "addressCity": {"dataType":"string","required":true},
            "addressCountry": {"dataType":"string","required":true},
            "invoiceAddressStreet": {"dataType":"string"},
            "invoiceAddressPostalCode": {"dataType":"string"},
            "invoiceAddressCity": {"dataType":"string"},
            "invoiceAddressCountry": {"dataType":"string"},
            "status": {"ref":"CompanyStatus"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_CompanyParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"name":{"dataType":"string"},"comments":{"dataType":"string"},"phoneNumber":{"dataType":"string"},"addressStreet":{"dataType":"string"},"addressPostalCode":{"dataType":"string"},"addressCity":{"dataType":"string"},"addressCountry":{"dataType":"string"},"invoiceAddressStreet":{"dataType":"string"},"invoiceAddressPostalCode":{"dataType":"string"},"invoiceAddressCity":{"dataType":"string"},"invoiceAddressCountry":{"dataType":"string"},"status":{"ref":"CompanyStatus"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductsPerCategory": {
        "dataType": "refObject",
        "properties": {
            "categoryId": {"dataType":"double","required":true},
            "amount": {"dataType":"array","array":{"dataType":"double"},"required":true},
            "nrOfProducts": {"dataType":"array","array":{"dataType":"double"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContractedProductsAnalysis": {
        "dataType": "refObject",
        "properties": {
            "categories": {"dataType":"array","array":{"dataType":"refObject","ref":"ProductsPerCategory"},"required":true},
            "labels": {"dataType":"array","array":{"dataType":"string"}},
            "financialYears": {"dataType":"array","array":{"dataType":"double"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BaseFile": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "downloadName": {"dataType":"string","required":true},
            "location": {"dataType":"string","required":true},
            "createdById": {"dataType":"double","required":true},
            "createdBy": {"ref":"User","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_FileParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"name":{"dataType":"string"},"createdAt":{"dataType":"datetime"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BaseActivity": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "type": {"ref":"ActivityType","required":true},
            "descriptionEnglish": {"dataType":"string","required":true},
            "descriptionDutch": {"dataType":"string","required":true},
            "createdById": {"dataType":"double","required":true},
            "createdBy": {"ref":"User","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ActivityParams": {
        "dataType": "refObject",
        "properties": {
            "description": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_ActivityParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"description":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContactListResponse": {
        "dataType": "refObject",
        "properties": {
            "list": {"dataType":"array","array":{"dataType":"refObject","ref":"Contact"},"required":true},
            "count": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContactSummary": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "firstName": {"dataType":"string","required":true},
            "lastNamePreposition": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "companyId": {"dataType":"double","required":true},
            "function": {"ref":"ContactFunction","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContactParams": {
        "dataType": "refObject",
        "properties": {
            "gender": {"ref":"Gender","required":true},
            "firstName": {"dataType":"string"},
            "lastNamePreposition": {"dataType":"string"},
            "lastName": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "telephone": {"dataType":"string"},
            "comments": {"dataType":"string"},
            "companyId": {"dataType":"double","required":true},
            "function": {"ref":"ContactFunction","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_ContactParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"gender":{"ref":"Gender"},"firstName":{"dataType":"string"},"lastNamePreposition":{"dataType":"string"},"lastName":{"dataType":"string"},"email":{"dataType":"string"},"telephone":{"dataType":"string"},"comments":{"dataType":"string"},"companyId":{"dataType":"double"},"function":{"ref":"ContactFunction"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContractListResponse": {
        "dataType": "refObject",
        "properties": {
            "list": {"dataType":"array","array":{"dataType":"refObject","ref":"Contract"},"required":true},
            "count": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContractSummary": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "title": {"dataType":"string","required":true},
            "value": {"dataType":"double","required":true},
            "status": {"ref":"ContractStatus","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RecentContract": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "title": {"dataType":"string","required":true},
            "companyId": {"dataType":"double","required":true},
            "assignedToId": {"dataType":"double","required":true},
            "contactId": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "type": {"ref":"ActivityType","required":true},
            "description": {"dataType":"string","required":true},
            "createdById": {"dataType":"double","required":true},
            "subType": {"ref":"ContractStatus","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContractParams": {
        "dataType": "refObject",
        "properties": {
            "title": {"dataType":"string","required":true},
            "companyId": {"dataType":"double","required":true},
            "contactId": {"dataType":"double","required":true},
            "comments": {"dataType":"string"},
            "assignedToId": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_ContractParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"title":{"dataType":"string"},"companyId":{"dataType":"double"},"contactId":{"dataType":"double"},"comments":{"dataType":"string"},"assignedToId":{"dataType":"double"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductInstanceParams": {
        "dataType": "refObject",
        "properties": {
            "productId": {"dataType":"double","required":true},
            "basePrice": {"dataType":"double","required":true},
            "discount": {"dataType":"double"},
            "details": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_ProductInstanceParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"productId":{"dataType":"double"},"basePrice":{"dataType":"double"},"discount":{"dataType":"double"},"details":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductInstanceStatusParams": {
        "dataType": "refObject",
        "properties": {
            "description": {"dataType":"string","required":true},
            "subType": {"ref":"ProductInstanceStatus","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Language": {
        "dataType": "refEnum",
        "enums": ["DUTCH","ENGLISH"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContractType": {
        "dataType": "refEnum",
        "enums": ["CONTRACT","PROPOSAL"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ReturnFileType": {
        "dataType": "refEnum",
        "enums": ["PDF","TEX"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GenerateContractParams": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "createdAt": {"dataType":"datetime"},
            "language": {"ref":"Language","required":true},
            "contentType": {"ref":"ContractType","required":true},
            "fileType": {"ref":"ReturnFileType","required":true},
            "showDiscountPercentages": {"dataType":"boolean","required":true},
            "saveToDisk": {"dataType":"boolean","required":true},
            "signee1Id": {"dataType":"double","required":true},
            "signee2Id": {"dataType":"double","required":true},
            "recipientId": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContractStatusParams": {
        "dataType": "refObject",
        "properties": {
            "description": {"dataType":"string","required":true},
            "subType": {"ref":"ContractStatus","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InvoiceListResponse": {
        "dataType": "refObject",
        "properties": {
            "list": {"dataType":"array","array":{"dataType":"refObject","ref":"Invoice"},"required":true},
            "count": {"dataType":"double","required":true},
            "lastSeen": {"dataType":"datetime"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InvoiceSummary": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "title": {"dataType":"string","required":true},
            "companyId": {"dataType":"double","required":true},
            "value": {"dataType":"double","required":true},
            "status": {"ref":"InvoiceStatus","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExpiredInvoice": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "version": {"dataType":"double","required":true},
            "startDate": {"dataType":"datetime","required":true},
            "companyId": {"dataType":"double","required":true},
            "assignedToId": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "createdById": {"dataType":"double","required":true},
            "value": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InvoiceCreateParams": {
        "dataType": "refObject",
        "properties": {
            "title": {"dataType":"string","required":true},
            "poNumber": {"dataType":"string"},
            "comments": {"dataType":"string"},
            "startDate": {"dataType":"datetime"},
            "assignedToId": {"dataType":"double"},
            "productInstanceIds": {"dataType":"array","array":{"dataType":"double"},"required":true},
            "companyId": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_InvoiceParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"title":{"dataType":"string"},"poNumber":{"dataType":"string"},"comments":{"dataType":"string"},"startDate":{"dataType":"datetime"},"assignedToId":{"dataType":"double"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GenerateInvoiceParams": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "createdAt": {"dataType":"datetime"},
            "language": {"ref":"Language","required":true},
            "fileType": {"ref":"ReturnFileType","required":true},
            "showDiscountPercentages": {"dataType":"boolean","required":true},
            "saveToDisk": {"dataType":"boolean","required":true},
            "recipientId": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CustomRecipient": {
        "dataType": "refObject",
        "properties": {
            "number": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "organizationName": {"dataType":"string"},
            "street": {"dataType":"string"},
            "postalCode": {"dataType":"string"},
            "city": {"dataType":"string"},
            "country": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CustomProduct": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "amount": {"dataType":"double","required":true},
            "pricePerOne": {"dataType":"double","required":true},
            "valueAddedTax": {"ref":"VAT","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CustomInvoiceGenSettings": {
        "dataType": "refObject",
        "properties": {
            "language": {"ref":"Language","required":true},
            "fileType": {"ref":"ReturnFileType","required":true},
            "recipient": {"ref":"CustomRecipient","required":true},
            "subject": {"dataType":"string","required":true},
            "ourReference": {"dataType":"string","required":true},
            "theirReference": {"dataType":"string"},
            "products": {"dataType":"array","array":{"dataType":"refObject","ref":"CustomProduct"},"required":true},
            "date": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InvoiceStatusParams": {
        "dataType": "refObject",
        "properties": {
            "description": {"dataType":"string","required":true},
            "subType": {"ref":"InvoiceStatus","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CategoryListResponse": {
        "dataType": "refObject",
        "properties": {
            "list": {"dataType":"array","array":{"dataType":"refObject","ref":"ProductCategory"},"required":true},
            "count": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CategorySummary": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CategoryParams": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_CategoryParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"name":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductListResponse": {
        "dataType": "refObject",
        "properties": {
            "list": {"dataType":"array","array":{"dataType":"refObject","ref":"Product"},"required":true},
            "count": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductSummary": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "vatId": {"dataType":"double","required":true},
            "nameDutch": {"dataType":"string","required":true},
            "nameEnglish": {"dataType":"string","required":true},
            "targetPrice": {"dataType":"double","required":true},
            "status": {"ref":"ProductStatus","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductParams": {
        "dataType": "refObject",
        "properties": {
            "nameDutch": {"dataType":"string","required":true},
            "nameEnglish": {"dataType":"string","required":true},
            "targetPrice": {"dataType":"double","required":true},
            "minTarget": {"dataType":"double"},
            "maxTarget": {"dataType":"double"},
            "status": {"ref":"ProductStatus","required":true},
            "description": {"dataType":"string"},
            "vatId": {"dataType":"double","required":true},
            "categoryId": {"dataType":"double","required":true},
            "contractTextDutch": {"dataType":"string","required":true},
            "contractTextEnglish": {"dataType":"string","required":true},
            "deliverySpecificationDutch": {"dataType":"string"},
            "deliverySpecificationEnglish": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_ProductParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"nameDutch":{"dataType":"string"},"nameEnglish":{"dataType":"string"},"targetPrice":{"dataType":"double"},"minTarget":{"dataType":"double"},"maxTarget":{"dataType":"double"},"status":{"ref":"ProductStatus"},"description":{"dataType":"string"},"vatId":{"dataType":"double"},"categoryId":{"dataType":"double"},"contractTextDutch":{"dataType":"string"},"contractTextEnglish":{"dataType":"string"},"deliverySpecificationDutch":{"dataType":"string"},"deliverySpecificationEnglish":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_PricingParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"description":{"dataType":"string"},"data":{"dataType":"array","array":{"dataType":"array","array":{"dataType":"string"}}}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductInstanceListResponse": {
        "dataType": "refObject",
        "properties": {
            "list": {"dataType":"array","array":{"dataType":"refObject","ref":"ProductInstance"},"required":true},
            "count": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginationParams": {
        "dataType": "refObject",
        "properties": {
            "skip": {"dataType":"double"},
            "take": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AnalysisResultByYear": {
        "dataType": "refObject",
        "properties": {
            "amount": {"dataType":"double","required":true},
            "nrOfProducts": {"dataType":"double","required":true},
            "year": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AnalysisResult": {
        "dataType": "refObject",
        "properties": {
            "amount": {"dataType":"double","required":true},
            "nrOfProducts": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InvoicedAmounts": {
        "dataType": "refObject",
        "properties": {
            "delivered": {"ref":"AnalysisResult","required":true},
            "notDelivered": {"ref":"AnalysisResult","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DashboardProductInstanceStats": {
        "dataType": "refObject",
        "properties": {
            "suggested": {"ref":"AnalysisResult","required":true},
            "contracted": {"ref":"AnalysisResult","required":true},
            "delivered": {"ref":"AnalysisResult","required":true},
            "invoiced": {"ref":"InvoicedAmounts","required":true},
            "paid": {"ref":"AnalysisResult","required":true},
            "financialYears": {"dataType":"array","array":{"dataType":"double"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_RoleParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"ldapGroup":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Roles": {
        "dataType": "refEnum",
        "enums": ["SIGNEE","FINANCIAL","ADMIN","GENERAL","AUDIT"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserParams": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "firstName": {"dataType":"string","required":true},
            "lastNamePreposition": {"dataType":"string"},
            "lastName": {"dataType":"string","required":true},
            "function": {"dataType":"string","required":true},
            "gender": {"ref":"Gender","required":true},
            "replyToEmail": {"dataType":"string"},
            "receiveEmails": {"dataType":"boolean"},
            "sendEmailsToReplyToEmail": {"dataType":"boolean"},
            "comment": {"dataType":"string"},
            "ldapOverrideEmail": {"dataType":"boolean"},
            "roles": {"dataType":"array","array":{"dataType":"refEnum","ref":"Roles"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SetupParams": {
        "dataType": "refObject",
        "properties": {
            "admin": {"ref":"UserParams","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuthStatus": {
        "dataType": "refObject",
        "properties": {
            "authenticated": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Profile": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "gender": {"ref":"Gender","required":true},
            "firstName": {"dataType":"string","required":true},
            "lastNamePreposition": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "replyToEmail": {"dataType":"string","required":true},
            "comment": {"dataType":"string","required":true},
            "function": {"dataType":"string","required":true},
            "avatarFilename": {"dataType":"string","required":true},
            "backgroundFilename": {"dataType":"string","required":true},
            "receiveEmails": {"dataType":"boolean","required":true},
            "sendEmailsToReplyToEmail": {"dataType":"boolean","required":true},
            "roles": {"dataType":"array","array":{"dataType":"refObject","ref":"Role"},"required":true},
            "identityLocal": {"ref":"IdentityLocal"},
            "identityLdap": {"ref":"IdentityLDAP"},
            "hasApiKey": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResetPasswordRequest": {
        "dataType": "refObject",
        "properties": {
            "password": {"dataType":"string","required":true},
            "repeatPassword": {"dataType":"string","required":true},
            "token": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GeneralPrivateInfo": {
        "dataType": "refObject",
        "properties": {
            "financialYears": {"dataType":"array","array":{"dataType":"double"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginMethods": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["local"]},{"dataType":"enum","enums":["ldap"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GeneralPublicInfo": {
        "dataType": "refObject",
        "properties": {
            "loginMethod": {"ref":"LoginMethods","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserListResponse": {
        "dataType": "refObject",
        "properties": {
            "list": {"dataType":"array","array":{"dataType":"refObject","ref":"User"},"required":true},
            "count": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserSummary": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "firstName": {"dataType":"string","required":true},
            "lastNamePreposition": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "avatarFilename": {"dataType":"string","required":true},
            "backgroundFilename": {"dataType":"string","required":true},
            "roles": {"dataType":"array","array":{"dataType":"refEnum","ref":"Roles"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_UserParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"email":{"dataType":"string"},"firstName":{"dataType":"string"},"lastNamePreposition":{"dataType":"string"},"lastName":{"dataType":"string"},"function":{"dataType":"string"},"gender":{"ref":"Gender"},"replyToEmail":{"dataType":"string"},"receiveEmails":{"dataType":"boolean"},"sendEmailsToReplyToEmail":{"dataType":"boolean"},"comment":{"dataType":"string"},"ldapOverrideEmail":{"dataType":"boolean"},"roles":{"dataType":"array","array":{"dataType":"refEnum","ref":"Roles"}}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TransferUserParams": {
        "dataType": "refObject",
        "properties": {
            "toUserId": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LdapIdentityParams": {
        "dataType": "refObject",
        "properties": {
            "username": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_LdapIdentityParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"username":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VATListResponse": {
        "dataType": "refObject",
        "properties": {
            "list": {"dataType":"array","array":{"dataType":"refObject","ref":"ValueAddedTax"},"required":true},
            "count": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VATSummary": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "amount": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_VATParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"category":{"ref":"VAT"},"amount":{"dataType":"double"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const validationService = new ValidationService(models);

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: Router) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
        app.post('/api/company/table',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.getAllCompanies)),

            function CompanyController_getAllCompanies(request: any, response: any, next: any) {
            const args = {
                    lp: {"in":"body","name":"lp","required":true,"ref":"ListParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.getAllCompanies.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/company/compact',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.getCompanySummaries)),

            function CompanyController_getCompanySummaries(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.getCompanySummaries.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/company/extensive',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.getAllContractsExtensive)),

            function CompanyController_getAllContractsExtensive(request: any, response: any, next: any) {
            const args = {
                    lp: {"in":"body","name":"lp","required":true,"ref":"ListParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.getAllContractsExtensive.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/company/:id',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.getCompany)),

            function CompanyController_getCompany(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.getCompany.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/company',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.createCompany)),

            function CompanyController_createCompany(request: any, response: any, next: any) {
            const args = {
                    params: {"in":"body","name":"params","required":true,"ref":"CompanyParams"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.createCompany.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/company/:id',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.updateCompany)),

            function CompanyController_updateCompany(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_CompanyParams_"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.updateCompany.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/company/:id',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.deleteCompany)),

            function CompanyController_deleteCompany(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.deleteCompany.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/company/:id/logo',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.uploadCompanyLogo)),

            function CompanyController_uploadCompanyLogo(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.uploadCompanyLogo.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/company/:id/logo',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.deleteCompanyLogo)),

            function CompanyController_deleteCompanyLogo(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.deleteCompanyLogo.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/company/:id/invoices',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.getUnresolvedInvoices)),

            function CompanyController_getUnresolvedInvoices(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.getUnresolvedInvoices.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/company/:id/contacts',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.getContacts)),

            function CompanyController_getContacts(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.getContacts.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/company/:id/statistics',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.getCompanyStatistics)),

            function CompanyController_getCompanyStatistics(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.getCompanyStatistics.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/company/:id/file/upload',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.uploadCompanyFile)),

            function CompanyController_uploadCompanyFile(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.uploadCompanyFile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/company/:id/file/:fileId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.getCompanyFile)),

            function CompanyController_getCompanyFile(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.getCompanyFile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/company/:id/file/:fileId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.updateCompanyFile)),

            function CompanyController_updateCompanyFile(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_FileParams_"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.updateCompanyFile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/company/:id/file/:fileId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.deleteCompanyFile)),

            function CompanyController_deleteCompanyFile(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.deleteCompanyFile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/company/:id/comment',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.addCompanyComment)),

            function CompanyController_addCompanyComment(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"ActivityParams"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.addCompanyComment.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/company/:id/activity/:activityId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.updateCompanyActivity)),

            function CompanyController_updateCompanyActivity(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    activityId: {"in":"path","name":"activityId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_ActivityParams_"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.updateCompanyActivity.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/company/:id/activity/:activityId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(CompanyController)),
            ...(fetchMiddlewares<RequestHandler>(CompanyController.prototype.deleteCompanyActivity)),

            function CompanyController_deleteCompanyActivity(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    activityId: {"in":"path","name":"activityId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new CompanyController();


              const promise = controller.deleteCompanyActivity.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contact/table',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContactController)),
            ...(fetchMiddlewares<RequestHandler>(ContactController.prototype.getAllContacts)),

            function ContactController_getAllContacts(request: any, response: any, next: any) {
            const args = {
                    lp: {"in":"body","name":"lp","required":true,"ref":"ListParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContactController();


              const promise = controller.getAllContacts.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/contact/compact',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContactController)),
            ...(fetchMiddlewares<RequestHandler>(ContactController.prototype.getContactSummaries)),

            function ContactController_getContactSummaries(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContactController();


              const promise = controller.getContactSummaries.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/contact/:id',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContactController)),
            ...(fetchMiddlewares<RequestHandler>(ContactController.prototype.getContact)),

            function ContactController_getContact(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContactController();


              const promise = controller.getContact.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contact',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContactController)),
            ...(fetchMiddlewares<RequestHandler>(ContactController.prototype.createContact)),

            function ContactController_createContact(request: any, response: any, next: any) {
            const args = {
                    params: {"in":"body","name":"params","required":true,"ref":"ContactParams"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContactController();


              const promise = controller.createContact.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/contact/:id',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContactController)),
            ...(fetchMiddlewares<RequestHandler>(ContactController.prototype.updateContact)),

            function ContactController_updateContact(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_ContactParams_"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContactController();


              const promise = controller.updateContact.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/contact/:id',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContactController)),
            ...(fetchMiddlewares<RequestHandler>(ContactController.prototype.deleteContact)),

            function ContactController_deleteContact(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContactController();


              const promise = controller.deleteContact.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contract/table',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.getAllContracts)),

            function ContractController_getAllContracts(request: any, response: any, next: any) {
            const args = {
                    lp: {"in":"body","name":"lp","required":true,"ref":"ListParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.getAllContracts.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/contract/compact',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.getContractSummaries)),

            function ContractController_getContractSummaries(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.getContractSummaries.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/contract/recent',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.getRecentContracts)),

            function ContractController_getRecentContracts(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.getRecentContracts.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/contract/:id',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.getContract)),

            function ContractController_getContract(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.getContract.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contract',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.createContract)),

            function ContractController_createContract(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    params: {"in":"body","name":"params","required":true,"ref":"ContractParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.createContract.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/contract/:id',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.updateContract)),

            function ContractController_updateContract(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_ContractParams_"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.updateContract.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/contract/:id',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.deleteContract)),

            function ContractController_deleteContract(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.deleteContract.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contract/:id/product',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.addProductInstanceToContract)),

            function ContractController_addProductInstanceToContract(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"ProductInstanceParams"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.addProductInstanceToContract.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/contract/:id/product/:prodId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.updateProductInstanceOnContract)),

            function ContractController_updateProductInstanceOnContract(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    prodId: {"in":"path","name":"prodId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_ProductInstanceParams_"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.updateProductInstanceOnContract.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/contract/:id/product/:prodId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.deleteProductInstance)),

            function ContractController_deleteProductInstance(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    prodId: {"in":"path","name":"prodId","required":true,"dataType":"double"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.deleteProductInstance.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contract/:id/product/:prodId/status',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.addProductInstanceStatusToContract)),

            function ContractController_addProductInstanceStatusToContract(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    prodId: {"in":"path","name":"prodId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"ProductInstanceStatusParams"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.addProductInstanceStatusToContract.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contract/:id/product/:prodId/comment',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.addProductInstanceCommentToContract)),

            function ContractController_addProductInstanceCommentToContract(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    prodId: {"in":"path","name":"prodId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"ActivityParams"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.addProductInstanceCommentToContract.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/contract/:id/product/:prodId/activity/:activityId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.updateProductInstanceActivityOnContract)),

            function ContractController_updateProductInstanceActivityOnContract(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    prodId: {"in":"path","name":"prodId","required":true,"dataType":"double"},
                    activityId: {"in":"path","name":"activityId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_ActivityParams_"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.updateProductInstanceActivityOnContract.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/contract/:id/product/:prodId/activity/:activityId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.deleteProductInstanceActivityFromContract)),

            function ContractController_deleteProductInstanceActivityFromContract(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    prodId: {"in":"path","name":"prodId","required":true,"dataType":"double"},
                    activityId: {"in":"path","name":"activityId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.deleteProductInstanceActivityFromContract.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contract/:id/file/generate',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.generateContractFile)),

            function ContractController_generateContractFile(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"GenerateContractParams"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.generateContractFile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contract/:id/file/upload',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.uploadContractFile)),

            function ContractController_uploadContractFile(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.uploadContractFile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/contract/:id/file/:fileId',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.getContractFile)),

            function ContractController_getContractFile(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.getContractFile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/contract/:id/file/:fileId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.updateContractFile)),

            function ContractController_updateContractFile(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_FileParams_"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.updateContractFile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/contract/:id/file/:fileId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.deleteContractFile)),

            function ContractController_deleteContractFile(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.deleteContractFile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contract/:id/status',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.addContractStatus)),

            function ContractController_addContractStatus(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"ContractStatusParams"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.addContractStatus.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contract/:id/comment',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.addContractComment)),

            function ContractController_addContractComment(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"ActivityParams"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.addContractComment.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/contract/:id/activity/:activityId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.updateContractActivity)),

            function ContractController_updateContractActivity(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    activityId: {"in":"path","name":"activityId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_ActivityParams_"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.updateContractActivity.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/contract/:id/activity/:activityId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ContractController)),
            ...(fetchMiddlewares<RequestHandler>(ContractController.prototype.deleteContractActivity)),

            function ContractController_deleteContractActivity(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    activityId: {"in":"path","name":"activityId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ContractController();


              const promise = controller.deleteContractActivity.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/invoice/table',
            authenticateMiddleware([{"local":["FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController)),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController.prototype.getAllInvoices)),

            function InvoiceController_getAllInvoices(request: any, response: any, next: any) {
            const args = {
                    lp: {"in":"body","name":"lp","required":true,"ref":"ListParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new InvoiceController();


              const promise = controller.getAllInvoices.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/invoice/compact',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController)),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController.prototype.getInvoiceSummaries)),

            function InvoiceController_getInvoiceSummaries(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new InvoiceController();


              const promise = controller.getInvoiceSummaries.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/invoice/expired',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController)),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController.prototype.getExpiredInvoices)),

            function InvoiceController_getExpiredInvoices(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new InvoiceController();


              const promise = controller.getExpiredInvoices.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/invoice/lastseen',
            authenticateMiddleware([{"local":["FINANCIAL"]}]),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController)),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController.prototype.updateLastSeenByTreasurer)),

            function InvoiceController_updateLastSeenByTreasurer(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new InvoiceController();


              const promise = controller.updateLastSeenByTreasurer.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/invoice/:id',
            authenticateMiddleware([{"local":["FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController)),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController.prototype.getInvoice)),

            function InvoiceController_getInvoice(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new InvoiceController();


              const promise = controller.getInvoice.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/invoice',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController)),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController.prototype.createInvoice)),

            function InvoiceController_createInvoice(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    params: {"in":"body","name":"params","required":true,"ref":"InvoiceCreateParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new InvoiceController();


              const promise = controller.createInvoice.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/invoice/:id',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController)),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController.prototype.updateInvoice)),

            function InvoiceController_updateInvoice(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_InvoiceParams_"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new InvoiceController();


              const promise = controller.updateInvoice.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/invoice/:id',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController)),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController.prototype.deleteInvoice)),

            function InvoiceController_deleteInvoice(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new InvoiceController();


              const promise = controller.deleteInvoice.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/invoice/:id/product',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController)),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController.prototype.addProductToInvoice)),

            function InvoiceController_addProductToInvoice(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"productId":{"dataType":"double","required":true}}},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new InvoiceController();


              const promise = controller.addProductToInvoice.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/invoice/:id/product/:prodId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController)),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController.prototype.deleteProductFromInvoice)),

            function InvoiceController_deleteProductFromInvoice(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    prodId: {"in":"path","name":"prodId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new InvoiceController();


              const promise = controller.deleteProductFromInvoice.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/invoice/:id/file/generate',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController)),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController.prototype.generateInvoiceFile)),

            function InvoiceController_generateInvoiceFile(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"GenerateInvoiceParams"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new InvoiceController();


              const promise = controller.generateInvoiceFile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/invoice/:id/file/upload',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController)),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController.prototype.uploadInvoiceFile)),

            function InvoiceController_uploadInvoiceFile(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new InvoiceController();


              const promise = controller.uploadInvoiceFile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/invoice/:id/file/:fileId',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController)),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController.prototype.getInvoiceFile)),

            function InvoiceController_getInvoiceFile(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new InvoiceController();


              const promise = controller.getInvoiceFile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/invoice/:id/file/:fileId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController)),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController.prototype.updateInvoiceFile)),

            function InvoiceController_updateInvoiceFile(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_FileParams_"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new InvoiceController();


              const promise = controller.updateInvoiceFile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/invoice/:id/file/:fileId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController)),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController.prototype.deleteInvoiceFile)),

            function InvoiceController_deleteInvoiceFile(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new InvoiceController();


              const promise = controller.deleteInvoiceFile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/invoice/custom',
            authenticateMiddleware([{"local":["FINANCIAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController)),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController.prototype.generateCustomInvoice)),

            function InvoiceController_generateCustomInvoice(request: any, response: any, next: any) {
            const args = {
                    params: {"in":"body","name":"params","required":true,"ref":"CustomInvoiceGenSettings"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new InvoiceController();


              const promise = controller.generateCustomInvoice.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/invoice/:id/status',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","FINANCIAL"]}]),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController)),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController.prototype.addInvoiceStatus)),

            function InvoiceController_addInvoiceStatus(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"InvoiceStatusParams"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new InvoiceController();


              const promise = controller.addInvoiceStatus.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/invoice/:id/comment',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController)),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController.prototype.addInvoiceComment)),

            function InvoiceController_addInvoiceComment(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"ActivityParams"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new InvoiceController();


              const promise = controller.addInvoiceComment.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/invoice/:id/activity/:activityId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController)),
            ...(fetchMiddlewares<RequestHandler>(InvoiceController.prototype.updateInvoiceActivity)),

            function InvoiceController_updateInvoiceActivity(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    activityId: {"in":"path","name":"activityId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_ActivityParams_"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new InvoiceController();


              const promise = controller.updateInvoiceActivity.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/category/table',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductCategoryController)),
            ...(fetchMiddlewares<RequestHandler>(ProductCategoryController.prototype.getAllCategories)),

            function ProductCategoryController_getAllCategories(request: any, response: any, next: any) {
            const args = {
                    lp: {"in":"body","name":"lp","required":true,"ref":"ListParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductCategoryController();


              const promise = controller.getAllCategories.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/category/compact',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductCategoryController)),
            ...(fetchMiddlewares<RequestHandler>(ProductCategoryController.prototype.getCategorySummaries)),

            function ProductCategoryController_getCategorySummaries(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductCategoryController();


              const promise = controller.getCategorySummaries.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/category',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductCategoryController)),
            ...(fetchMiddlewares<RequestHandler>(ProductCategoryController.prototype.createCategory)),

            function ProductCategoryController_createCategory(request: any, response: any, next: any) {
            const args = {
                    params: {"in":"body","name":"params","required":true,"ref":"CategoryParams"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductCategoryController();


              const promise = controller.createCategory.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/category/:id',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductCategoryController)),
            ...(fetchMiddlewares<RequestHandler>(ProductCategoryController.prototype.getCategory)),

            function ProductCategoryController_getCategory(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductCategoryController();


              const promise = controller.getCategory.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/category/:id',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductCategoryController)),
            ...(fetchMiddlewares<RequestHandler>(ProductCategoryController.prototype.updateCategory)),

            function ProductCategoryController_updateCategory(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_CategoryParams_"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductCategoryController();


              const promise = controller.updateCategory.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/category/:id',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductCategoryController)),
            ...(fetchMiddlewares<RequestHandler>(ProductCategoryController.prototype.deleteCategory)),

            function ProductCategoryController_deleteCategory(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductCategoryController();


              const promise = controller.deleteCategory.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/category/stats/contracted/:year',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductCategoryController)),
            ...(fetchMiddlewares<RequestHandler>(ProductCategoryController.prototype.getContractedProductsStatistics)),

            function ProductCategoryController_getContractedProductsStatistics(request: any, response: any, next: any) {
            const args = {
                    year: {"in":"path","name":"year","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductCategoryController();


              const promise = controller.getContractedProductsStatistics.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/product/table',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.getAllProducts)),

            function ProductController_getAllProducts(request: any, response: any, next: any) {
            const args = {
                    lp: {"in":"body","name":"lp","required":true,"ref":"ListParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.getAllProducts.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/product/compact',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.getProductSummaries)),

            function ProductController_getProductSummaries(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.getProductSummaries.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/product/:id',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.getProduct)),

            function ProductController_getProduct(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.getProduct.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/product',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.createProduct)),

            function ProductController_createProduct(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    params: {"in":"body","name":"params","required":true,"ref":"ProductParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.createProduct.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/product/:id',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.updateProduct)),

            function ProductController_updateProduct(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_ProductParams_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.updateProduct.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/product/:id',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.deleteProduct)),

            function ProductController_deleteProduct(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.deleteProduct.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/product/:id/pricing',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.addPricing)),

            function ProductController_addPricing(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.addPricing.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/product/:id/pricing',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.updatePricing)),

            function ProductController_updatePricing(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_PricingParams_"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.updatePricing.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/product/:id/pricing',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.deletePricing)),

            function ProductController_deletePricing(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.deletePricing.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/product/:id/contracts',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.getProductContracts)),

            function ProductController_getProductContracts(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"PaginationParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.getProductContracts.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/product/:id/invoices',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.getProductInvoices)),

            function ProductController_getProductInvoices(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"PaginationParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.getProductInvoices.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/product/:id/statistics',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.getProductStatistics)),

            function ProductController_getProductStatistics(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.getProductStatistics.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/product/:id/file/upload',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.uploadProductFile)),

            function ProductController_uploadProductFile(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.uploadProductFile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/product/:id/file/:fileId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.getProductFile)),

            function ProductController_getProductFile(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.getProductFile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/product/:id/file/:fileId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.updateProductFile)),

            function ProductController_updateProductFile(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_FileParams_"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.updateProductFile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/product/:id/file/:fileId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.deleteProductFile)),

            function ProductController_deleteProductFile(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.deleteProductFile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/product/:id/comment',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.addProductComment)),

            function ProductController_addProductComment(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"ActivityParams"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.addProductComment.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/product/:id/activity/:activityId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.updateProductActivity)),

            function ProductController_updateProductActivity(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    activityId: {"in":"path","name":"activityId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_ActivityParams_"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.updateProductActivity.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/product/:id/activity/:activityId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.deleteProductActivity)),

            function ProductController_deleteProductActivity(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    activityId: {"in":"path","name":"activityId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.deleteProductActivity.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/product/stats/statuses/:year',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.getDashboardProductInstanceStatistics)),

            function ProductController_getDashboardProductInstanceStatistics(request: any, response: any, next: any) {
            const args = {
                    year: {"in":"path","name":"year","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ProductController();


              const promise = controller.getDashboardProductInstanceStatistics.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/role',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(RoleController)),
            ...(fetchMiddlewares<RequestHandler>(RoleController.prototype.getAllRoles)),

            function RoleController_getAllRoles(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new RoleController();


              const promise = controller.getAllRoles.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/role/:id',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(RoleController)),
            ...(fetchMiddlewares<RequestHandler>(RoleController.prototype.getRole)),

            function RoleController_getRole(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new RoleController();


              const promise = controller.getRole.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/role/:id',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(RoleController)),
            ...(fetchMiddlewares<RequestHandler>(RoleController.prototype.updateRole)),

            function RoleController_updateRole(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_RoleParams_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new RoleController();


              const promise = controller.updateRole.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/setup',
            ...(fetchMiddlewares<RequestHandler>(RootController)),
            ...(fetchMiddlewares<RequestHandler>(RootController.prototype.postSetup)),

            function RootController_postSetup(request: any, response: any, next: any) {
            const args = {
                    params: {"in":"body","name":"params","required":true,"ref":"SetupParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new RootController();


              const promise = controller.postSetup.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/authStatus',
            ...(fetchMiddlewares<RequestHandler>(RootController)),
            ...(fetchMiddlewares<RequestHandler>(RootController.prototype.getAuthStatus)),

            function RootController_getAuthStatus(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new RootController();


              const promise = controller.getAuthStatus.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/profile',
            authenticateMiddleware([{"local":[]}]),
            ...(fetchMiddlewares<RequestHandler>(RootController)),
            ...(fetchMiddlewares<RequestHandler>(RootController.prototype.getProfile)),

            function RootController_getProfile(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new RootController();


              const promise = controller.getProfile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/logout',
            ...(fetchMiddlewares<RequestHandler>(RootController)),
            ...(fetchMiddlewares<RequestHandler>(RootController.prototype.logout)),

            function RootController_logout(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new RootController();


              const promise = controller.logout.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/forgotPassword',
            ...(fetchMiddlewares<RequestHandler>(RootController)),
            ...(fetchMiddlewares<RequestHandler>(RootController.prototype.forgotPassword)),

            function RootController_forgotPassword(request: any, response: any, next: any) {
            const args = {
                    email: {"in":"query","name":"email","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new RootController();


              const promise = controller.forgotPassword.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/resetPassword',
            ...(fetchMiddlewares<RequestHandler>(RootController)),
            ...(fetchMiddlewares<RequestHandler>(RootController.prototype.resetPassword)),

            function RootController_resetPassword(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    reqBody: {"in":"body","name":"reqBody","required":true,"ref":"ResetPasswordRequest"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new RootController();


              const promise = controller.resetPassword.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/generateApiKey',
            authenticateMiddleware([{"local":[]}]),
            ...(fetchMiddlewares<RequestHandler>(RootController)),
            ...(fetchMiddlewares<RequestHandler>(RootController.prototype.generateApiKey)),

            function RootController_generateApiKey(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new RootController();


              const promise = controller.generateApiKey.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/getApiKey',
            authenticateMiddleware([{"local":[]}]),
            ...(fetchMiddlewares<RequestHandler>(RootController)),
            ...(fetchMiddlewares<RequestHandler>(RootController.prototype.getApiKey)),

            function RootController_getApiKey(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new RootController();


              const promise = controller.getApiKey.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/revokeApiKey',
            authenticateMiddleware([{"local":[]}]),
            ...(fetchMiddlewares<RequestHandler>(RootController)),
            ...(fetchMiddlewares<RequestHandler>(RootController.prototype.revokeApiKey)),

            function RootController_revokeApiKey(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new RootController();


              const promise = controller.revokeApiKey.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/getPrivateGeneralInfo',
            authenticateMiddleware([{"local":[]}]),
            ...(fetchMiddlewares<RequestHandler>(RootController)),
            ...(fetchMiddlewares<RequestHandler>(RootController.prototype.getPrivateGeneralInfo)),

            function RootController_getPrivateGeneralInfo(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new RootController();


              const promise = controller.getPrivateGeneralInfo.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/getPublicGeneralInfo',
            ...(fetchMiddlewares<RequestHandler>(RootController)),
            ...(fetchMiddlewares<RequestHandler>(RootController.prototype.getPublicGeneralInfo)),

            function RootController_getPublicGeneralInfo(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new RootController();


              const promise = controller.getPublicGeneralInfo.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/user/table',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.getAllUsers)),

            function UserController_getAllUsers(request: any, response: any, next: any) {
            const args = {
                    lp: {"in":"body","name":"lp","required":true,"ref":"ListParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new UserController();


              const promise = controller.getAllUsers.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/user/compact',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.getUserSummaries)),

            function UserController_getUserSummaries(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new UserController();


              const promise = controller.getUserSummaries.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/user/:id',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.getUser)),

            function UserController_getUser(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new UserController();


              const promise = controller.getUser.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/user/:id',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.deleteUser)),

            function UserController_deleteUser(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new UserController();


              const promise = controller.deleteUser.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/user',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.createUser)),

            function UserController_createUser(request: any, response: any, next: any) {
            const args = {
                    params: {"in":"body","name":"params","required":true,"ref":"UserParams"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new UserController();


              const promise = controller.createUser.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/user/:id',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.updateUser)),

            function UserController_updateUser(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_UserParams_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new UserController();


              const promise = controller.updateUser.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/user/:id/logo',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.uploadUserAvatar)),

            function UserController_uploadUserAvatar(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new UserController();


              const promise = controller.uploadUserAvatar.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/user/:id/logo',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.deleteUserAvatar)),

            function UserController_deleteUserAvatar(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new UserController();


              const promise = controller.deleteUserAvatar.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/user/:id/background',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.uploadUserBackground)),

            function UserController_uploadUserBackground(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new UserController();


              const promise = controller.uploadUserBackground.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/user/:id/background',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.deleteUserBackground)),

            function UserController_deleteUserBackground(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new UserController();


              const promise = controller.deleteUserBackground.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/user/:id/assignments',
            authenticateMiddleware([{"local":["ADMIN","GENERAL"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.transferAssignments)),

            function UserController_transferAssignments(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"TransferUserParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new UserController();


              const promise = controller.transferAssignments.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/user/:id/auth/local',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.createLocalIdentity)),

            function UserController_createLocalIdentity(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new UserController();


              const promise = controller.createLocalIdentity.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/user/:id/auth/local',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.deleteLocalIdentity)),

            function UserController_deleteLocalIdentity(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new UserController();


              const promise = controller.deleteLocalIdentity.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/user/:id/auth/ldap',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.createLdapIdentity)),

            function UserController_createLdapIdentity(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"LdapIdentityParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new UserController();


              const promise = controller.createLdapIdentity.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/user/:id/auth/ldap',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.updateLdapIdentity)),

            function UserController_updateLdapIdentity(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_LdapIdentityParams_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new UserController();


              const promise = controller.updateLdapIdentity.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/user/:id/auth/ldap',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.deleteLdapIdentity)),

            function UserController_deleteLdapIdentity(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new UserController();


              const promise = controller.deleteLdapIdentity.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/VAT/table',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(VATController)),
            ...(fetchMiddlewares<RequestHandler>(VATController.prototype.getAllVAT)),

            function VATController_getAllVAT(request: any, response: any, next: any) {
            const args = {
                    lp: {"in":"body","name":"lp","required":true,"ref":"ListParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new VATController();


              const promise = controller.getAllVAT.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/VAT/compact',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            ...(fetchMiddlewares<RequestHandler>(VATController)),
            ...(fetchMiddlewares<RequestHandler>(VATController.prototype.getVATSummaries)),

            function VATController_getVATSummaries(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new VATController();


              const promise = controller.getVATSummaries.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/VAT/:id',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(VATController)),
            ...(fetchMiddlewares<RequestHandler>(VATController.prototype.getVAT)),

            function VATController_getVAT(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new VATController();


              const promise = controller.getVAT.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/VAT/:id',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(VATController)),
            ...(fetchMiddlewares<RequestHandler>(VATController.prototype.updateVAT)),

            function VATController_updateVAT(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_VATParams_"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new VATController();


              const promise = controller.updateVAT.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
        return async function runAuthenticationMiddleware(request: any, _response: any, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts: any[] = [];
            const pushAndRethrow = (error: any) => {
                failedAttempts.push(error);
                throw error;
            };

            const secMethodOrPromises: Promise<any>[] = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises: Promise<any>[] = [];

                    for (const name in secMethod) {
                        secMethodAndPromises.push(
                            expressAuthentication(request, name, secMethod[name])
                                .catch(pushAndRethrow)
                        );
                    }

                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                } else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(
                            expressAuthentication(request, name, secMethod[name])
                                .catch(pushAndRethrow)
                        );
                    }
                }
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            try {
                request['user'] = await promiseAny.call(Promise, secMethodOrPromises);
                next();
            }
            catch(err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;
                next(error);
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function isController(object: any): object is Controller {
        return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
    }

    function promiseHandler(controllerObj: any, promise: any, response: any, successStatus: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                let statusCode = successStatus;
                let headers;
                if (isController(controllerObj)) {
                    headers = controllerObj.getHeaders();
                    statusCode = controllerObj.getStatus() || statusCode;
                }

                // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                returnHandler(response, statusCode, data, headers)
            })
            .catch((error: any) => next(error));
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function returnHandler(response: any, statusCode?: number, data?: any, headers: any = {}) {
        if (response.headersSent) {
            return;
        }
        Object.keys(headers).forEach((name: string) => {
            response.set(name, headers[name]);
        });
        if (data && typeof data.pipe === 'function' && data.readable && typeof data._read === 'function') {
            response.status(statusCode || 200)
            data.pipe(response);
        } else if (data !== null && data !== undefined) {
            response.status(statusCode || 200).json(data);
        } else {
            response.status(statusCode || 204).end();
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function responder(response: any): TsoaResponse<HttpStatusCodeLiteral, unknown>  {
        return function(status, data, headers) {
            returnHandler(response, status, data, headers);
        };
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function getValidatedArgs(args: any, request: any, response: any): any[] {
        const fieldErrors: FieldErrors  = {};
        const values = Object.keys(args).map((key) => {
            const name = args[key].name;
            switch (args[key].in) {
                case 'request':
                    return request;
                case 'query':
                    return validationService.ValidateParam(args[key], request.query[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'queries':
                    return validationService.ValidateParam(args[key], request.query, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'path':
                    return validationService.ValidateParam(args[key], request.params[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'header':
                    return validationService.ValidateParam(args[key], request.header(name), name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body':
                    return validationService.ValidateParam(args[key], request.body, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body-prop':
                    return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, 'body.', {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'formData':
                    if (args[key].dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.file, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else if (args[key].dataType === 'array' && args[key].array.dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.files, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else {
                        return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    }
                case 'res':
                    return responder(response);
            }
        });

        if (Object.keys(fieldErrors).length > 0) {
            throw new ValidateError(fieldErrors, '');
        }
        return values;
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
