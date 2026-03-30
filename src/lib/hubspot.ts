import { z } from "zod";

const programmingLevelSchema = z.enum([
  "Iniciante",
  "Atuo na área há menos de 2 anos",
  "Atuo na área há mais de 2 anos",
]);

export type ProgrammingLevel = z.infer<typeof programmingLevelSchema>;

export interface HubSpotContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  programmingLevel: ProgrammingLevel;
}

export async function syncContactToHubSpot(
  data: HubSpotContactData
): Promise<{ contactId: string; success: boolean }> {
  const portalId = process.env.HUBSPOT_PORTAL_ID;
  const formId = process.env.HUBSPOT_FORM_ID;

  if (!portalId || !formId) {
    throw new Error("HUBSPOT_PORTAL_ID or HUBSPOT_FORM_ID is not set");
  }

  // Remove símbolos do telefone, mantendo apenas números
  const cleanPhone = data.phone.replace(/\D/g, "");

  const hubspotPayload = {
    fields: [
      {
        name: "firstname",
        value: data.firstName,
      },
      {
        name: "lastname",
        value: data.lastName,
      },
      {
        name: "email",
        value: data.email,
      },
      {
        name: "phone",
        value: cleanPhone,
      },
      {
        name: "nivel_de_programacao",
        value: data.programmingLevel,
      },
    ],
    context: {
      pageUri: "https://devroast.app",
      pageName: "DevRoast - User Profile Form",
    },
  };

  try {
    console.log("[HubSpot] Submitting form data:", hubspotPayload);
    
    const response = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hubspotPayload),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("[HubSpot] Forms API error:", error);
      throw new Error(`HubSpot Forms API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("[HubSpot] Form submitted successfully:", result);
    
    return {
      contactId: result.id || formId,
      success: true,
    };
  } catch (error) {
    console.error("[HubSpot] Error syncing to HubSpot:", error);
    throw error;
  }
}
