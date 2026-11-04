/**
 * @file Passenger.ts
 * OOP Concept: Encapsulation & Data Abstraction
 * Demonstrates private properties with getters, setters, validation, and domain methods.
 */

import { Gender, IdProofType, BerthPreference, PassengerData } from '../types/index.ts';

export class Passenger {
  // Encapsulated private attributes
  private _id: string;
  private _name: string;
  private _age: number;
  private _gender: Gender;
  private _phone: string;
  private _email: string;
  private _idProofType: IdProofType;
  private _idProofNumber: string;
  private _berthPreference: BerthPreference;
  private _allocatedSeat?: string;
  private _allocatedCoach?: string;

  /**
   * Parameterized Constructor
   */
  constructor(
    id: string,
    name: string,
    age: number,
    gender: Gender,
    phone: string,
    email: string,
    idProofType: IdProofType = 'Aadhaar Card',
    idProofNumber: string = '',
    berthPreference: BerthPreference = 'No Preference',
    allocatedSeat?: string,
    allocatedCoach?: string
  ) {
    this._id = id;
    this._name = name.trim();
    this.validateAge(age);
    this._age = age;
    this._gender = gender;
    this._phone = phone.trim();
    this._email = email.trim().toLowerCase();
    this._idProofType = idProofType;
    this._idProofNumber = idProofNumber.trim();
    this._berthPreference = berthPreference;
    this._allocatedSeat = allocatedSeat;
    this._allocatedCoach = allocatedCoach;
  }

  // Private validation method
  private validateAge(age: number): void {
    if (age < 0 || age > 125) {
      throw new Error(`Invalid passenger age: ${age}. Age must be between 0 and 125.`);
    }
  }

  // Getters & Setters (Encapsulation)
  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public set name(value: string) {
    if (!value || value.trim().length < 2) {
      throw new Error('Passenger name must be at least 2 characters long.');
    }
    this._name = value.trim();
  }

  public get age(): number {
    return this._age;
  }

  public set age(value: number) {
    this.validateAge(value);
    this._age = value;
  }

  public get gender(): Gender {
    return this._gender;
  }

  public set gender(value: Gender) {
    this._gender = value;
  }

  public get phone(): string {
    return this._phone;
  }

  public set phone(value: string) {
    this._phone = value.trim();
  }

  public get email(): string {
    return this._email;
  }

  public set email(value: string) {
    this._email = value.trim().toLowerCase();
  }

  public get idProofType(): IdProofType {
    return this._idProofType;
  }

  public get idProofNumber(): string {
    return this._idProofNumber;
  }

  public get berthPreference(): BerthPreference {
    return this._berthPreference;
  }

  public set berthPreference(value: BerthPreference) {
    this._berthPreference = value;
  }

  public get allocatedSeat(): string | undefined {
    return this._allocatedSeat;
  }

  public set allocatedSeat(seat: string | undefined) {
    this._allocatedSeat = seat;
  }

  public get allocatedCoach(): string | undefined {
    return this._allocatedCoach;
  }

  public set allocatedCoach(coach: string | undefined) {
    this._allocatedCoach = coach;
  }

  /**
   * Domain method: Checks if passenger qualifies for Senior Citizen concession & lower berth priority
   */
  public isSeniorCitizen(): boolean {
    return this._age >= 60;
  }

  /**
   * Domain method: Masks ID proof for privacy compliance (e.g., Aadhaar XXXX-XXXX-1234)
   */
  public getMaskedIdProof(): string {
    if (!this._idProofNumber || this._idProofNumber.length < 4) {
      return 'XXXX-XXXX';
    }
    const lastFour = this._idProofNumber.slice(-4);
    return `••••-••••-${lastFour}`;
  }

  /**
   * Serializer for Cloud Firestore document compatibility
   */
  public toFirestoreData(): PassengerData {
    return {
      id: this._id,
      name: this._name,
      age: this._age,
      gender: this._gender,
      phone: this._phone,
      email: this._email,
      idProofType: this._idProofType,
      idProofNumber: this._idProofNumber,
      berthPreference: this._berthPreference,
      allocatedSeat: this._allocatedSeat,
      allocatedCoach: this._allocatedCoach,
    };
  }

  /**
   * Factory method to construct Passenger object from Firestore/JSON object
   */
  public static fromFirestoreData(data: PassengerData): Passenger {
    return new Passenger(
      data.id,
      data.name,
      data.age,
      data.gender,
      data.phone,
      data.email,
      data.idProofType,
      data.idProofNumber,
      data.berthPreference || 'No Preference',
      data.allocatedSeat,
      data.allocatedCoach
    );
  }
}
