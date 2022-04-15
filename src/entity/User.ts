import {
  Column,
  Entity, JoinTable, ManyToMany, OneToOne,
} from 'typeorm';
import { BaseEnt } from './BaseEnt';
import { Gender } from './enums/Gender';
// eslint-disable-next-line import/no-cycle
import { Role } from './Role';
import { Roles } from './enums/Roles';
import { IdentityLDAP } from './IdentityLDAP';
import { IdentityLocal } from './IdentityLocal';
// // eslint-disable-next-line import/no-cycle
// import { CompanyActivity } from './activity/CompanyActivity';
// // eslint-disable-next-line import/no-cycle
// import { ContractActivity } from './activity/ContractActivity';
// // eslint-disable-next-line import/no-cycle
// import { InvoiceActivity } from './activity/InvoiceActivity';
// // eslint-disable-next-line import/no-cycle
// import { ProductActivity } from './activity/ProductActivity';
// // eslint-disable-next-line import/no-cycle
// import { ProductInstanceActivity } from './activity/ProductInstanceActivity';

@Entity()
export class User extends BaseEnt {
  /** Gender of this user */
  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.UNKNOWN,
  })
  gender!: Gender;

  /** First name of this user */
  @Column()
  firstName!: string;

  /** Middle name of this user, if he/she has any */
  @Column({ default: '' })
  lastNamePreposition!: string;

  /** Last name of this user */
  @Column()
  lastName!: string;

  /** Email address of the user */
  @Column({ unique: true })
  email!: string;

  /** Email address used in PDF files */
  @Column({ default: '' })
  replyToEmail!: string;

  /** Any comments regarding this user */
  @Column({ type: 'text', default: '' })
  comment!: string;

  /** Function of this user, used when generating documents and printed below this user's name */
  @Column()
  function!: string;

  /** Optional filename of the user's avatar */
  @Column({ default: '' })
  avatarFilename!: string;

  /** Optional filename of the user's background */
  @Column({ default: '' })
  backgroundFilename!: string;

  /** Whether this user wishes to receive (regular) email updates, e.g. sent invoices */
  @Column({ default: false })
  receiveEmails!: boolean;

  /** Whether the update emails (from the boolean above) should
   * be sent to "email", or "replyToEmail" */
  @Column({ default: false })
  sendEmailsToReplyToEmail!: boolean;

  /** The roles this user has */
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles!: Role[];

  /** Identity for local login */
  @OneToOne(() => IdentityLocal, (local) => local.user)
  identityLocal?: IdentityLocal;

  /** Identity for LDAP */
  @OneToOne(() => IdentityLDAP, (ldap) => ldap.user)
  identityLdap?: IdentityLDAP;

  // This code has been disabled because it somehow creates cyclical dependencies,
  // which is pretty weird
  // @OneToMany(() => CompanyActivity, (activity) => activity.createdBy)
  // companyActivities!: CompanyActivity[];
  //
  // @OneToMany(() => ContractActivity, (activity) => activity.createdBy)
  // contractActivity!: ContractActivity[];
  //
  // @OneToMany(() => InvoiceActivity, (activity) => activity.createdBy)
  // invoiceActivities!: InvoiceActivity[];
  //
  // @OneToMany(() => ProductActivity, (activity) => activity.createdBy)
  // productActivities!: ProductActivity[];
  //
  // @OneToMany(() => ProductInstanceActivity, (activity) => activity.createdBy)
  // productInstanceActivities!: CompanyActivity[];

  public fullName() {
    if (this.lastNamePreposition === '') {
      return `${this.firstName} ${this.lastName}`;
    }
    return `${this.firstName} ${this.lastNamePreposition} ${this.lastName}`;
  }

  public formalGreet() {
    if (this.lastNamePreposition === '') {
      return `${this.lastName}`;
    }
    return `${this.lastNamePreposition} ${this.lastName}`;
  }

  /**
   * Get a list of all roles this user has
   */
  public getRoles(): Roles[] {
    return this.roles.map((r) => r.name) as Roles[];
  }

  /**
   * Return whether this user has the specified role.
   * @param role Roles enum type
   */
  public hasRole(role: Roles): boolean {
    return this.roles.some((r) => {
      return r.name === role;
    });
  }
}
