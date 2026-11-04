/**
 * @file Station.ts
 * OOP Class representing a Railway Station
 * Encapsulation, State Preservation, and Data Serialization
 */

import { StationData } from '../types/index.ts';

export class Station {
  private _code: string;
  private _name: string;
  private _city: string;
  private _state: string;
  private _zone: string;
  private _division?: string;
  private _category?: string;
  private _latitude?: number;
  private _longitude?: number;
  private _aliases?: string[];

  constructor(
    code: string,
    name: string,
    city: string,
    state: string,
    zone: string,
    division?: string,
    category?: string,
    latitude?: number,
    longitude?: number,
    aliases?: string[]
  ) {
    this._code = code.toUpperCase();
    this._name = name;
    this._city = city;
    this._state = state;
    this._zone = zone;
    this._division = division;
    this._category = category;
    this._latitude = latitude;
    this._longitude = longitude;
    this._aliases = aliases;
  }

  public get code(): string { return this._code; }
  public get name(): string { return this._name; }
  public get city(): string { return this._city; }
  public get state(): string { return this._state; }
  public get zone(): string { return this._zone; }
  public get division(): string | undefined { return this._division; }
  public get category(): string | undefined { return this._category; }
  public get latitude(): number | undefined { return this._latitude; }
  public get longitude(): number | undefined { return this._longitude; }
  public get aliases(): string[] | undefined { return this._aliases; }

  public getDisplayName(): string {
    return `${this._name} (${this._code}) - ${this._city}, ${this._state}`;
  }

  public toJSON(): StationData {
    return {
      code: this._code,
      name: this._name,
      city: this._city,
      state: this._state,
      zone: this._zone,
      division: this._division,
      category: this._category,
      latitude: this._latitude,
      longitude: this._longitude,
      aliases: this._aliases,
    };
  }
}
