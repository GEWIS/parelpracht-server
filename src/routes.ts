/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute, HttpStatusCodeLiteral, TsoaResponse } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { RootController } from './controllers/RootController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ProductController } from './controllers/ProductController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CompanyController } from './controllers/CompanyController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ContractController } from './controllers/ContractController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { InvoiceController } from './controllers/InvoiceController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ContactController } from './controllers/ContactController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserController } from './controllers/UserController';
import { expressAuthentication } from './auth/authentication';
import * as express from 'express';

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "Gender": {
        "dataType": "refEnum",
        "enums": ["MALE","FEMALE","OTHER","UNKNOWN"],
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
            "middleName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "function": {"dataType":"string","required":true},
            "gender": {"ref":"Gender","required":true},
            "comment": {"dataType":"string","required":true},
            "roles": {"dataType":"array","array":{"dataType":"refEnum","enums":["SIGNEE","FINANCIAL","ADMIN","GENERAL","AUDIT"]}},
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
            "middleName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "comment": {"dataType":"string","required":true},
            "function": {"dataType":"string","required":true},
            "roles": {"dataType":"array","array":{"ref":"Role"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Role": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "users": {"dataType":"array","array":{"ref":"User"},"required":true},
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
    "ProductStatus": {
        "dataType": "refEnum",
        "enums": ["ACTIVE","INACTIVE"],
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
            "instances": {"dataType":"array","array":{"ref":"ProductInstance"},"required":true},
            "productActivities": {"dataType":"array","array":{"ref":"ProductActivity"},"required":true},
            "files": {"dataType":"array","array":{"ref":"ProductFile"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CompanyStatus": {
        "dataType": "refEnum",
        "enums": ["ACTIVE","INACTIVE"],
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
            "comments": {"dataType":"string"},
            "companyId": {"dataType":"double","required":true},
            "company": {"ref":"Company","required":true},
            "products": {"dataType":"array","array":{"ref":"ProductInstance"},"required":true},
            "createdById": {"dataType":"double","required":true},
            "createdBy": {"ref":"User","required":true},
            "assignedToId": {"dataType":"double","required":true},
            "assignedTo": {"ref":"User","required":true},
            "contactId": {"dataType":"double","required":true},
            "contact": {"ref":"Contact","required":true},
            "contractActivity": {"dataType":"array","array":{"ref":"ContractActivity"},"required":true},
            "files": {"dataType":"array","array":{"ref":"ContractFile"},"required":true},
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
            "productInstanceActivities": {"dataType":"array","array":{"ref":"ProductActivity"},"required":true},
            "price": {"dataType":"double","required":true},
            "comments": {"dataType":"string"},
        },
        "additionalProperties": false,
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
            "description": {"dataType":"string"},
            "phoneNumber": {"dataType":"string"},
            "addressStreet": {"dataType":"string","required":true},
            "addressPostalCode": {"dataType":"string","required":true},
            "addressCity": {"dataType":"string","required":true},
            "addressCountry": {"dataType":"string","required":true},
            "invoiceAddressStreet": {"dataType":"string","required":true},
            "invoiceAddressPostalCode": {"dataType":"string","required":true},
            "invoiceAddressCity": {"dataType":"string","required":true},
            "invoiceAddressCountry": {"dataType":"string","required":true},
            "status": {"ref":"CompanyStatus","required":true},
            "endDate": {"dataType":"datetime"},
            "contracts": {"dataType":"array","array":{"ref":"Contract"},"required":true},
            "invoices": {"dataType":"array","array":{"ref":"Invoice"},"required":true},
            "contacts": {"dataType":"array","array":{"ref":"Contact"},"required":true},
            "activities": {"dataType":"array","array":{"ref":"CompanyActivity"},"required":true},
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
            "products": {"dataType":"array","array":{"ref":"ProductInstance"},"required":true},
            "poNumber": {"dataType":"string"},
            "comments": {"dataType":"string"},
            "companyId": {"dataType":"double","required":true},
            "createdById": {"dataType":"double","required":true},
            "createdBy": {"ref":"User","required":true},
            "assignedToId": {"dataType":"double","required":true},
            "assignedTo": {"ref":"User","required":true},
            "company": {"ref":"Company","required":true},
            "invoiceActivities": {"dataType":"array","array":{"ref":"InvoiceActivity"},"required":true},
            "files": {"dataType":"array","array":{"ref":"InvoiceFile"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ActivityType": {
        "dataType": "refEnum",
        "enums": ["STATUS","COMMENT"],
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
            "subType": {"dataType":"string"},
            "description": {"dataType":"string","required":true},
            "createdBy": {"ref":"User"},
            "invoiceId": {"dataType":"double","required":true},
            "invoice": {"ref":"Invoice","required":true},
            "relatedInvoiceId": {"dataType":"double"},
            "relatedInvoice": {"ref":"Invoice"},
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
            "middleName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "telephone": {"dataType":"string","required":true},
            "comments": {"dataType":"string","required":true},
            "function": {"ref":"ContactFunction","required":true},
            "companyId": {"dataType":"double","required":true},
            "company": {"ref":"Company","required":true},
            "contracts": {"dataType":"array","array":{"ref":"Contract"},"required":true},
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
            "subType": {"dataType":"string"},
            "description": {"dataType":"string","required":true},
            "createdBy": {"ref":"User"},
            "companyId": {"dataType":"double","required":true},
            "company": {"ref":"Company","required":true},
        },
        "additionalProperties": false,
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
            "subType": {"dataType":"string"},
            "description": {"dataType":"string","required":true},
            "createdBy": {"ref":"User"},
            "contractId": {"dataType":"double","required":true},
            "contract": {"ref":"Contract","required":true},
            "relatedContractId": {"dataType":"double"},
            "relatedContract": {"ref":"Contract"},
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
    "ProductActivity": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "version": {"dataType":"double","required":true},
            "type": {"ref":"ActivityType","required":true},
            "subType": {"dataType":"string"},
            "description": {"dataType":"string","required":true},
            "createdBy": {"ref":"User"},
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
    "ProductListResponse": {
        "dataType": "refObject",
        "properties": {
            "list": {"dataType":"array","array":{"ref":"Product"},"required":true},
            "count": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductSummary": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "nameDutch": {"dataType":"string","required":true},
            "nameEnglish": {"dataType":"string","required":true},
            "targetPrice": {"dataType":"double","required":true},
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
            "status": {"ref":"ProductStatus","required":true},
            "description": {"dataType":"string","required":true},
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
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"nameDutch":{"dataType":"string"},"nameEnglish":{"dataType":"string"},"targetPrice":{"dataType":"double"},"status":{"ref":"ProductStatus"},"description":{"dataType":"string"},"contractTextDutch":{"dataType":"string"},"contractTextEnglish":{"dataType":"string"},"deliverySpecificationDutch":{"dataType":"string"},"deliverySpecificationEnglish":{"dataType":"string"}},"validators":{}},
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
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"name":{"dataType":"string"}},"validators":{}},
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
            "subType": {"dataType":"string"},
            "description": {"dataType":"string","required":true},
            "createdBy": {"ref":"User"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "StatusParams": {
        "dataType": "refObject",
        "properties": {
            "description": {"dataType":"string","required":true},
            "relatedEntityId": {"dataType":"double"},
            "createdById": {"dataType":"double","required":true},
            "subtype": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CommentParams": {
        "dataType": "refObject",
        "properties": {
            "description": {"dataType":"string","required":true},
            "relatedEntityId": {"dataType":"double"},
            "createdById": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_UpdateActivityParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"description":{"dataType":"string"},"relatedEntityId":{"dataType":"double"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CompanyListResponse": {
        "dataType": "refObject",
        "properties": {
            "list": {"dataType":"array","array":{"ref":"Company"},"required":true},
            "count": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CompanySummary": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CompanyParams": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
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
            "endDate": {"dataType":"datetime"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_CompanyParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"name":{"dataType":"string"},"description":{"dataType":"string"},"phoneNumber":{"dataType":"string"},"addressStreet":{"dataType":"string"},"addressPostalCode":{"dataType":"string"},"addressCity":{"dataType":"string"},"addressCountry":{"dataType":"string"},"invoiceAddressStreet":{"dataType":"string"},"invoiceAddressPostalCode":{"dataType":"string"},"invoiceAddressCity":{"dataType":"string"},"invoiceAddressCountry":{"dataType":"string"},"status":{"ref":"CompanyStatus"},"endDate":{"dataType":"datetime"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContractListResponse": {
        "dataType": "refObject",
        "properties": {
            "list": {"dataType":"array","array":{"ref":"Contract"},"required":true},
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
            "price": {"dataType":"double","required":true},
            "comments": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_ProductInstanceParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"productId":{"dataType":"double"},"price":{"dataType":"double"},"comments":{"dataType":"string"}},"validators":{}},
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
            "name": {"dataType":"string","required":true},
            "language": {"ref":"Language","required":true},
            "contentType": {"ref":"ContractType","required":true},
            "fileType": {"ref":"ReturnFileType","required":true},
            "saveToDisk": {"dataType":"boolean","required":true},
            "signee1Id": {"dataType":"double","required":true},
            "signee2Id": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InvoiceListResponse": {
        "dataType": "refObject",
        "properties": {
            "list": {"dataType":"array","array":{"ref":"Invoice"},"required":true},
            "count": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InvoiceSummary": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "companyName": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InvoiceParams": {
        "dataType": "refObject",
        "properties": {
            "companyId": {"dataType":"double","required":true},
            "productInstanceIds": {"dataType":"array","array":{"dataType":"double"},"required":true},
            "poNumber": {"dataType":"string"},
            "comments": {"dataType":"string"},
            "assignedToId": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_InvoiceParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"companyId":{"dataType":"double"},"productInstanceIds":{"dataType":"array","array":{"dataType":"double"}},"poNumber":{"dataType":"string"},"comments":{"dataType":"string"},"assignedToId":{"dataType":"double"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GenerateInvoiceParams": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "language": {"ref":"Language","required":true},
            "fileType": {"ref":"ReturnFileType","required":true},
            "saveToDisk": {"dataType":"boolean","required":true},
            "recipientId": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContactListResponse": {
        "dataType": "refObject",
        "properties": {
            "list": {"dataType":"array","array":{"ref":"Contact"},"required":true},
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
            "middleName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "companyName": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContactParams": {
        "dataType": "refObject",
        "properties": {
            "gender": {"ref":"Gender","required":true},
            "firstName": {"dataType":"string","required":true},
            "middleName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "telephone": {"dataType":"string","required":true},
            "comments": {"dataType":"string","required":true},
            "companyId": {"dataType":"double","required":true},
            "function": {"ref":"ContactFunction","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_ContactParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"gender":{"ref":"Gender"},"firstName":{"dataType":"string"},"middleName":{"dataType":"string"},"lastName":{"dataType":"string"},"email":{"dataType":"string"},"telephone":{"dataType":"string"},"comments":{"dataType":"string"},"companyId":{"dataType":"double"},"function":{"ref":"ContactFunction"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserListResponse": {
        "dataType": "refObject",
        "properties": {
            "list": {"dataType":"array","array":{"ref":"User"},"required":true},
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
            "middleName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_UserParams_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"email":{"dataType":"string"},"firstName":{"dataType":"string"},"middleName":{"dataType":"string"},"lastName":{"dataType":"string"},"function":{"dataType":"string"},"gender":{"ref":"Gender"},"comment":{"dataType":"string"},"roles":{"dataType":"array","array":{"dataType":"refEnum","enums":["SIGNEE","FINANCIAL","ADMIN","GENERAL","AUDIT"]}}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const validationService = new ValidationService(models);

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: express.Router) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
        app.post('/api/setup',
            function (request: any, response: any, next: any) {
            const args = {
                    params: {"in":"body","name":"params","required":true,"ref":"SetupParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new RootController();


            const promise = controller.postSetup.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/authStatus',
            function (request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new RootController();


            const promise = controller.getAuthStatus.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/profile',
            authenticateMiddleware([{"local":[]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new RootController();


            const promise = controller.getProfile.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/logout',
            function (request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new RootController();


            const promise = controller.logout.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/forgotPassword',
            function (request: any, response: any, next: any) {
            const args = {
                    email: {"in":"query","name":"email","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new RootController();


            const promise = controller.forgotPassword.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/resetPassword',
            function (request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    reqBody: {"in":"body","name":"reqBody","required":true,"ref":"ResetPasswordRequest"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new RootController();


            const promise = controller.resetPassword.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/product',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    col: {"in":"query","name":"col","dataType":"string"},
                    dir: {"in":"query","name":"dir","dataType":"union","subSchemas":[{"dataType":"enum","enums":["ASC"]},{"dataType":"enum","enums":["DESC"]}]},
                    skip: {"in":"query","name":"skip","dataType":"double"},
                    take: {"in":"query","name":"take","dataType":"double"},
                    search: {"in":"query","name":"search","dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ProductController();


            const promise = controller.getAllProducts.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/product/compact',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ProductController();


            const promise = controller.getProductSummaries.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/product/:id',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ProductController();


            const promise = controller.getProduct.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/product',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    params: {"in":"body","name":"params","required":true,"ref":"ProductParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ProductController();


            const promise = controller.createProduct.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/product/:id',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_ProductParams_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ProductController();


            const promise = controller.updateProduct.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/product/:id/file/upload',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ProductController();


            const promise = controller.uploadFile.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/product/:id/file/:fileId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ProductController();


            const promise = controller.getFile.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/product/:id/file/:fileId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_FileParams_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ProductController();


            const promise = controller.updateFile.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/product/:id/file/:fileId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ProductController();


            const promise = controller.deleteFile.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/product/:id/status',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"StatusParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ProductController();


            const promise = controller.addStatus.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/product/:id/comment',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"CommentParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ProductController();


            const promise = controller.addComment.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/product/:id/activity/:activityId',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    activityId: {"in":"path","name":"activityId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_UpdateActivityParams_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ProductController();


            const promise = controller.updateActivity.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/product/:id/activity/:activityId',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    activityId: {"in":"path","name":"activityId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ProductController();


            const promise = controller.deleteActivity.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/company',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    col: {"in":"query","name":"col","dataType":"string"},
                    dir: {"in":"query","name":"dir","dataType":"union","subSchemas":[{"dataType":"enum","enums":["ASC"]},{"dataType":"enum","enums":["DESC"]}]},
                    skip: {"in":"query","name":"skip","dataType":"double"},
                    take: {"in":"query","name":"take","dataType":"double"},
                    search: {"in":"query","name":"search","dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new CompanyController();


            const promise = controller.getAllCompanies.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/company/compact',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new CompanyController();


            const promise = controller.getCompanySummaries.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/company/:id',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new CompanyController();


            const promise = controller.getCompany.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/company',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    params: {"in":"body","name":"params","required":true,"ref":"CompanyParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new CompanyController();


            const promise = controller.createCompany.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/company/:id',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_CompanyParams_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new CompanyController();


            const promise = controller.updateCompany.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/company/:id/status',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"StatusParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new CompanyController();


            const promise = controller.addStatus.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/company/:id/comment',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"CommentParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new CompanyController();


            const promise = controller.addComment.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/company/:id/activity/:activityId',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    activityId: {"in":"path","name":"activityId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_UpdateActivityParams_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new CompanyController();


            const promise = controller.updateActivity.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/company/:id/activity/:activityId',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    activityId: {"in":"path","name":"activityId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new CompanyController();


            const promise = controller.deleteActivity.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/company/company/:id/invoices',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new CompanyController();


            const promise = controller.getUnresolvedInvoices.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/company/company/:id/contacts',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new CompanyController();


            const promise = controller.getContacts.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/contract',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    col: {"in":"query","name":"col","dataType":"string"},
                    dir: {"in":"query","name":"dir","dataType":"union","subSchemas":[{"dataType":"enum","enums":["ASC"]},{"dataType":"enum","enums":["DESC"]}]},
                    skip: {"in":"query","name":"skip","dataType":"double"},
                    take: {"in":"query","name":"take","dataType":"double"},
                    search: {"in":"query","name":"search","dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.getAllContracts.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/contract/compact',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.getContractSummaries.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/contract/:id',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.getContract.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contract',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    params: {"in":"body","name":"params","required":true,"ref":"ContractParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.createContract.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/contract/:id',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_ContractParams_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.updateContract.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contract/:id/product',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"ProductInstanceParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.addProduct.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/contract/:id/product/:prodId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    prodId: {"in":"path","name":"prodId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_ProductInstanceParams_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.updateProduct.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/contract/:id/product/:prodId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    prodId: {"in":"path","name":"prodId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.deleteProduct.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contract/:id/product/:prodId/status',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    prodId: {"in":"path","name":"prodId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"StatusParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.addProductStatus.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contract/:id/product/:prodId/comment',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    prodId: {"in":"path","name":"prodId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"CommentParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.addProductComment.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/contract/:id/product/:prodId/activity/:activityId',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    prodId: {"in":"path","name":"prodId","required":true,"dataType":"double"},
                    activityId: {"in":"path","name":"activityId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_UpdateActivityParams_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.updateProductActivity.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/contract/:id/product/:prodId/activity/:activityId',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    prodId: {"in":"path","name":"prodId","required":true,"dataType":"double"},
                    activityId: {"in":"path","name":"activityId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.deleteProductActivity.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contract/:id/file/generate',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"GenerateContractParams"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.generateFile.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contract/:id/file/upload',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.uploadFile.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/contract/:id/file/:fileId',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.getFile.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/contract/:id/file/:fileId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_FileParams_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.updateFile.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/contract/:id/file/:fileId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.deleteFile.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contract/:id/status',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"StatusParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.addStatus.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contract/:id/comment',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"CommentParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.addComment.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/contract/:id/activity/:activityId',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    activityId: {"in":"path","name":"activityId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_UpdateActivityParams_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.updateActivity.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/contract/:id/activity/:activityId',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    activityId: {"in":"path","name":"activityId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContractController();


            const promise = controller.deleteActivity.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/invoice',
            authenticateMiddleware([{"local":["FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    col: {"in":"query","name":"col","dataType":"string"},
                    dir: {"in":"query","name":"dir","dataType":"union","subSchemas":[{"dataType":"enum","enums":["ASC"]},{"dataType":"enum","enums":["DESC"]}]},
                    skip: {"in":"query","name":"skip","dataType":"double"},
                    take: {"in":"query","name":"take","dataType":"double"},
                    search: {"in":"query","name":"search","dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new InvoiceController();


            const promise = controller.getAllInvoices.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/invoice/compact',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new InvoiceController();


            const promise = controller.getInvoiceSummaries.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/invoice/:id',
            authenticateMiddleware([{"local":["FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new InvoiceController();


            const promise = controller.getInvoice.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/invoice',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    params: {"in":"body","name":"params","required":true,"ref":"InvoiceParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new InvoiceController();


            const promise = controller.createInvoice.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/invoice/:id',
            authenticateMiddleware([{"local":["FINANCIAL","GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_InvoiceParams_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new InvoiceController();


            const promise = controller.updateInvoice.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/invoice/:id/product',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"productId":{"dataType":"double","required":true}}},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new InvoiceController();


            const promise = controller.addProduct.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/invoice/:id/product/:prodId',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    prodId: {"in":"path","name":"prodId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new InvoiceController();


            const promise = controller.deleteProduct.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/invoice/:id/file/generate',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"GenerateInvoiceParams"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new InvoiceController();


            const promise = controller.generateFile.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/invoice/:id/file/upload',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new InvoiceController();


            const promise = controller.uploadFile.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/invoice/:id/file/:fileId',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new InvoiceController();


            const promise = controller.getFile.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/invoice/:id/file/:fileId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_FileParams_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new InvoiceController();


            const promise = controller.updateFile.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/invoice/:id/file/:fileId',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new InvoiceController();


            const promise = controller.deleteFile.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/invoice/:id/status',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"StatusParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new InvoiceController();


            const promise = controller.addStatus.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/invoice/:id/comment',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"CommentParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new InvoiceController();


            const promise = controller.addComment.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/invoice/:id/activity/:activityId',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    activityId: {"in":"path","name":"activityId","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_UpdateActivityParams_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new InvoiceController();


            const promise = controller.updateActivity.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/invoice/:id/activity/:activityId',
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    activityId: {"in":"path","name":"activityId","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new InvoiceController();


            const promise = controller.deleteActivity.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/contact',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    col: {"in":"query","name":"col","dataType":"string"},
                    dir: {"in":"query","name":"dir","dataType":"union","subSchemas":[{"dataType":"enum","enums":["ASC"]},{"dataType":"enum","enums":["DESC"]}]},
                    skip: {"in":"query","name":"skip","dataType":"double"},
                    take: {"in":"query","name":"take","dataType":"double"},
                    search: {"in":"query","name":"search","dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContactController();


            const promise = controller.getAllContacts.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/contact/compact',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContactController();


            const promise = controller.getContactSummaries.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/contact/:id',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContactController();


            const promise = controller.getContact.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/contact',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    params: {"in":"body","name":"params","required":true,"ref":"ContactParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContactController();


            const promise = controller.createContact.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/contact/:id',
            authenticateMiddleware([{"local":["GENERAL","ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_ContactParams_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ContactController();


            const promise = controller.updateContact.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/user',
            authenticateMiddleware([{"local":["GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    col: {"in":"query","name":"col","dataType":"string"},
                    dir: {"in":"query","name":"dir","dataType":"union","subSchemas":[{"dataType":"enum","enums":["ASC"]},{"dataType":"enum","enums":["DESC"]}]},
                    skip: {"in":"query","name":"skip","dataType":"double"},
                    take: {"in":"query","name":"take","dataType":"double"},
                    search: {"in":"query","name":"search","dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new UserController();


            const promise = controller.getAllUsers.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/user/compact',
            authenticateMiddleware([{"local":["SIGNEE","FINANCIAL","GENERAL","ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new UserController();


            const promise = controller.getUserSummaries.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/user/:id',
            authenticateMiddleware([{"local":["ADMIN","AUDIT"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new UserController();


            const promise = controller.getUser.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/user/:id',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new UserController();


            const promise = controller.deleteUser.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/user',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    params: {"in":"body","name":"params","required":true,"ref":"UserParams"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new UserController();


            const promise = controller.createUser.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/user/:id',
            authenticateMiddleware([{"local":["ADMIN"]}]),
            function (request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"double"},
                    params: {"in":"body","name":"params","required":true,"ref":"Partial_UserParams_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new UserController();


            const promise = controller.updateUser.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
        return (request: any, _response: any, next: any) => {
            let responded = 0;
            let success = false;

            const succeed = function(user: any) {
                if (!success) {
                    success = true;
                    responded++;
                    request['user'] = user;
                    next();
                }
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            const fail = function(error: any) {
                responded++;
                if (responded == security.length && !success) {
                    error.status = error.status || 401;
                    next(error)
                }
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    let promises: Promise<any>[] = [];

                    for (const name in secMethod) {
                        promises.push(expressAuthentication(request, name, secMethod[name]));
                    }

                    Promise.all(promises)
                        .then((users) => { succeed(users[0]); })
                        .catch(fail);
                } else {
                    for (const name in secMethod) {
                        expressAuthentication(request, name, secMethod[name])
                            .then(succeed)
                            .catch(fail);
                    }
                }
            }
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function isController(object: any): object is Controller {
        return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
    }

    function promiseHandler(controllerObj: any, promise: any, response: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                let statusCode;
                let headers;
                if (isController(controllerObj)) {
                    headers = controllerObj.getHeaders();
                    statusCode = controllerObj.getStatus();
                }

                // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                returnHandler(response, statusCode, data, headers)
            })
            .catch((error: any) => next(error));
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function returnHandler(response: any, statusCode?: number, data?: any, headers: any = {}) {
        Object.keys(headers).forEach((name: string) => {
            response.set(name, headers[name]);
        });
        if (data && typeof data.pipe === 'function' && data.readable && typeof data._read === 'function') {
            data.pipe(response);
        } else if (data || data === false) { // === false allows boolean result
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
                    return validationService.ValidateParam(args[key], request.query[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"silently-remove-extras"});
                case 'path':
                    return validationService.ValidateParam(args[key], request.params[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"silently-remove-extras"});
                case 'header':
                    return validationService.ValidateParam(args[key], request.header(name), name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"silently-remove-extras"});
                case 'body':
                    return validationService.ValidateParam(args[key], request.body, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"silently-remove-extras"});
                case 'body-prop':
                    return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, 'body.', {"noImplicitAdditionalProperties":"silently-remove-extras"});
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
