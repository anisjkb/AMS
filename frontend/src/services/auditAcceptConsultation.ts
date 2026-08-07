export type AuditAcceptConsultationStatus =
  | "pending"
  | "in_review"
  | "approved"
  | "returned";

export type AuditAcceptConsultationDecision =
  | "approve"
  | "return";


export type AuditAcceptConsultation = {
  consultation_id: number;
  completion_id: number;
  audit_id: number;
  consultant_employee_id: number;
  assigned_by_user_id: string | null;
  status: AuditAcceptConsultationStatus;
  decision: AuditAcceptConsultationDecision | null;
  remarks: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};


export type CreateConsultationPayload = {
  completion_id: number;
  audit_id: number;
  consultant_employee_id: number;
};


export type UpdateConsultationPayload = {
  decision?: AuditAcceptConsultationDecision;
  remarks?: string;
};


const BASE_URL =
  "/api/backend/audit-accept-consultation";


async function requestJson<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {

  const response = await fetch(
    input,
    {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    },
  );


  if (!response.ok) {
    throw new Error(
      `Request failed with status ${response.status}`,
    );
  }


  return response.json();
}



export async function createAuditAcceptConsultation(
  payload: CreateConsultationPayload,
) {
  return requestJson<AuditAcceptConsultation>(
    `${BASE_URL}/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}



export async function getMyAuditAcceptConsultations() {
  return requestJson<AuditAcceptConsultation[]>(
    `${BASE_URL}/my-requests`,
  );
}




export async function getAuditAcceptConsultationManagement() {
  return requestJson<AuditAcceptConsultationManagement[]>(
    `${BASE_URL}/management`,
  );
}

export async function updateAuditAcceptConsultationDecision(
  consultationId: number,
  payload: UpdateConsultationPayload,
) {
  return requestJson<AuditAcceptConsultation>(
    `${BASE_URL}/${consultationId}/decision`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export type AuditAcceptConsultationManagement = {
  consultation_id: number;
  audit_id: number;
  audit_name: string;
  completion_id: number;
  consultant_employee_id: number;
  consultant_name: string;
  designation_name: string | null;
  status: AuditAcceptConsultationStatus;
  assigned_by_user_id: string | null;
  remarks: string | null;
  question_summary?: {
    total_questions: number;
    yes_count: number;
    no_count: number;
  };
};



export type AuditAcceptConsultationReview = {
  consultation_id: number;
  audit_id: number;

  client_name: string;
  audit_name: string;
  audit_type: string | null;
  audit_year: number | null;

  consultant_name: string;
  designation_name: string | null;

  status: AuditAcceptConsultationStatus;
  decision: AuditAcceptConsultationDecision | null;
  remarks: string | null;
  reviewed_at: string | null;

  workflow_status: string;
  acceptance_decision: string | null;
  safeguards_text: string | null;
  conclusion_remarks: string | null;

  questions: {
    item_id: number;
    item_no: string | null;
    title: string | null;
    content: string | null;
    answer_value: "yes" | "no" | null;
  }[];

  question_summary: {
    total_questions: number;
    yes_count: number;
    no_count: number;
  };
};

export type ConsultantEmployee = {
  id: number;
  employee_name: string;
  designation_name: string | null;
};




export async function getAuditAcceptConsultationReview(
  consultationId: number,
) {
  return requestJson<AuditAcceptConsultationReview>(
    `${BASE_URL}/${consultationId}/review`,
  );
}

export async function getConsultantEmployees() {
  return requestJson<ConsultantEmployee[]>(
    `${BASE_URL}/consultants`,
  );
}










