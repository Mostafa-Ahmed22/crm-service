import { Injectable } from '@nestjs/common';
import { LocationEntity } from 'src/definitions/entities/locations.entity';
import { LocationNode } from 'src/definitions/interfaces/locations.interface';

@Injectable()
export class HelperService {

  generateRandomPass(passLength:number){ 
    let pass = ''; 
    let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' 
        + 'abcdefghijklmnopqrstuvwxyz'
        + '0123456789@#$'; 
      
    for (let i = 1; i <= passLength; i++) { 
        var char = Math.floor(Math.random() * str.length + 1); 
        pass += str.charAt(char) 
    } 
    return pass; 
  }

  getPasswordTemplate(name:string, password:string){
    return `<html>
      <body style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background:#ffffff; border:1px solid #ddd; border-radius:6px;">
          <tr>
            <td style="background:#004aad; color:#fff; padding:15px; text-align:center; font-size:18px; font-weight:bold;">
              Welcome to MyPorto CRM
            </td>
          </tr>
          <tr>
            <td style="padding:20px; color:#333;">
              <p>Dear ${name},</p>
              <p>We’re glad to have you onboard. Here are your login credentials:</p>
              <p><strong>Password:</strong> ${password}</p>
              <p>Best regards,<br> <br>The MyPorto CRM Team</p>
              </td>
              </tr>
              <tr>
              </tr>
              </table>
              </body>
              </html>
              `
  }
  
  private buildLocationHierarchy(
    locations: LocationEntity[],
    language: string,
    parentId: number | null = null
  ): LocationNode[] {
    return locations
      .filter((location) => location.parent_location_id === parentId)
      .map((location) => ({
        id: location.id,
        name: location[`${language}_name`] ?? location.en_name,
        parent_location_id: location.parent_location_id,
        children: this.buildLocationHierarchy(locations, language, location.id)
      }));
  }
  
  getLocationHierarchy(
    locations: LocationEntity[],
    language: string
  ): LocationNode[] {
    return this.buildLocationHierarchy(locations, language);
  }
}