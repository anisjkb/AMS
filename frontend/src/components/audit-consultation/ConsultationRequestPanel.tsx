"use client";

import {
  Send,
  Loader2,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  createAuditAcceptConsultation,
} from "@/services/auditAcceptConsultation";


type Props = {
  auditId: number;
  completionId: number;
  onCreated?: () => void;
};


export default function ConsultationRequestPanel({
  auditId,
  completionId,
  onCreated,
}: Props) {

  const [employeeId, setEmployeeId] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  async function submitRequest() {

    if (!employeeId) {
      return;
    }


    try {

      setLoading(true);


      await createAuditAcceptConsultation({
        audit_id: auditId,
        completion_id: completionId,
        consultant_employee_id:
          Number(employeeId),
      });


      setEmployeeId("");

      onCreated?.();


    } finally {

      setLoading(false);

    }

  }


  return (

    <div className="rounded border p-4 space-y-4">

      <h2 className="font-semibold">
        Request Consultation
      </h2>


      <input
        value={employeeId}
        onChange={(e) =>
          setEmployeeId(e.target.value)
        }
        placeholder="Consultant Employee ID"
        className="w-full rounded border px-3 py-2"
      />


      <button
        onClick={submitRequest}
        disabled={loading}
        className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >

        {
          loading
            ? <Loader2 className="animate-spin" size={16}/>
            : <Send size={16}/>
        }

        Send Consultation Request

      </button>

    </div>

  );
}
