"use client";

import {
  useEffect,
  useState,
} from "react";

import ConsultationReviewPanel from "@/components/audit-consultation/ConsultationReviewPanel";

import {
  getAuditAcceptConsultationManagement,
  updateAuditAcceptConsultationDecision,
  getAuditAcceptConsultationReview,
  type AuditAcceptConsultationManagement,
  type AuditAcceptConsultationReview,
} from "@/services/auditAcceptConsultation";


export default function ConsultationManagementPage() {

  const [requests, setRequests] =
    useState<AuditAcceptConsultationManagement[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [reviewData, setReviewData] =
    useState<AuditAcceptConsultationReview | null>(null);


  async function loadRequests() {

    try {

      setLoading(true);

      const data =
        await getAuditAcceptConsultationManagement();

      setRequests(data);

    }
    finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    loadRequests();

  }, []);




  async function review(
    id:number,
  ){

    const data =
      await getAuditAcceptConsultationReview(
        id,
      );

    setReviewData(data);

  }

  async function approve(
    id: number,
  ) {

    await updateAuditAcceptConsultationDecision(
      id,
      {
        decision: "approve",
      },
    );

    await loadRequests();

  }



  function backToManagement(){
    setReviewData(null);
  }


  async function returnRequest(
    id: number,
    remarks:string,
  ) {

    await updateAuditAcceptConsultationDecision(
      id,
      {
        decision: "return",
        remarks,
      },
    );

    setReviewData(null);

    await loadRequests();

  }



  return (

    <div className="space-y-6 p-6">

      <div>

        <h1 className="text-2xl font-semibold">
          Consultation Management
        </h1>

        <p className="text-sm text-gray-500">
          Review and manage audit acceptance consultation requests.
        </p>

      </div>


      <ConsultationReviewPanel
        requests={requests}
        loading={loading}
        reviewData={reviewData}
        onReview={review}
        onApprove={approve}
        onReturn={returnRequest}
        onBack={backToManagement}
      />


    </div>

  );

}








