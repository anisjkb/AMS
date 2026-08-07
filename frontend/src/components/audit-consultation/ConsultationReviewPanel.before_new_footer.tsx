"use client";

import {
  CheckCircle2,
  Eye,
  Loader2,
  XCircle,
  ShieldCheck,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  AuditAcceptConsultationManagement,
  AuditAcceptConsultationReview,
} from "@/services/auditAcceptConsultation";

import { useNavigation } from "@/contexts/NavigationContext";


type Props = {
  requests: AuditAcceptConsultationManagement[];
  loading: boolean;

  reviewData:
    AuditAcceptConsultationReview | null;

  onReview: (
    id:number,
  ) => void;

  onApprove: (
    id:number,
  ) => void;

  onReturn: (
    id:number,
    remarks:string,
  ) => void;

  onBack: () => void;
};


export default function ConsultationReviewPanel({
  requests,
  loading,
  reviewData,
  onReview,
  onApprove,
  onReturn,
  onBack,
}:Props){

  const { hasPermission } = useNavigation();

  const [remarks,setRemarks]=useState("");

  const [showRejectModal,setShowRejectModal]=
    useState(false);

  const [rejectId,setRejectId]=
    useState<number | null>(null);


  if(loading){
    return (
      <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
        <Loader2 className="animate-spin"/>
        Loading consultation requests...
      </div>
    );
  }


  if(!requests.length){
    return (
      <div className="rounded border p-4">
        No consultation requests found.
      </div>
    );
  }


  return (

    <div className="space-y-5">

      {requests.map(item=>(

        <div
          key={item.consultation_id}
          className="rounded-xl border bg-white px-4 py-2 shadow-sm"
        >

          <div className="grid grid-cols-[0.5fr_1.05fr_1.25fr_0.55fr_0.55fr_0.55fr_0.55fr_auto] items-center gap-3 w-full">

            



                <div>
                  <p className="text-[10px] text-gray-500 leading-none">
                    Audit ID
                  </p>
                  <p className="text-[13px] font-bold">
                    #{item.audit_id}
                  </p>
                  <p className="text-[10px] text-gray-500 leading-none">
                    {item.audit_name}
                  </p>
                </div>


                <div>
                  <p className="text-[10px] text-gray-500 leading-none">
                    Consultant
                  </p>
                  <p className="text-[13px] font-semibold leading-none">
                    {item.consultant_name}
                  </p>
                </div>


                <div>
                  <p className="text-[10px] text-gray-500 leading-none">
                    Audit
                  </p>
                  <p className="text-[13px] font-semibold leading-none">
                    {item.audit_name}
                  </p>
                </div>


                <div>
                  <p className="text-[10px] text-gray-500 leading-none">
                    Workflow
                  </p>
                  <p className="text-[13px] font-semibold leading-none">
                    {item.status}
                  </p>
                </div>


                <div>
                  <p className="text-[10px] text-gray-500 leading-none">
                    Decision
                  </p>

                  <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {item.status}
                  </span>

                </div>


              
              <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">


                <div className="rounded-lg bg-blue-50 px-3 py-2 text-center min-w-[48px] h-[54px] flex flex-col items-center justify-center">
                  <p className="text-[10px] text-gray-500 leading-none">
                    Total
                  </p>
                  <b className="text-base">
                    {item.question_summary?.total_questions ?? 0}
                  </b>
                </div>


                <div className="rounded-lg bg-green-50 px-3 py-2 text-center min-w-[48px] h-[54px] flex flex-col items-center justify-center">
                  <p className="text-[10px] text-gray-500 leading-none">
                    YES
                  </p>
                  <b className="text-green-600 text-base">
                    {item.question_summary?.yes_count ?? 0}
                  </b>
                </div>


                <div className="rounded-lg bg-red-50 px-3 py-2 text-center min-w-[48px] h-[54px] flex flex-col items-center justify-center">
                  <p className="text-[10px] text-gray-500 leading-none">
                    NO
                  </p>
                  <b className="text-red-600 text-base">
                    {item.question_summary?.no_count ?? 0}
                  </b>
                </div>


              </div>


            

            <button
              onClick={()=>{
                onReview(
                  item.consultation_id
                );
              }}
              className="inline-flex items-center justify-center gap-1 justify-center h-9 rounded-lg bg-blue-600 px-2.5 text-xs text-white shadow hover:bg-blue-700 whitespace-nowrap"
            >

              <Eye size={13}/>

              Review

            </button>


          </div>



          {reviewData?.consultation_id ===
            item.consultation_id && (

            <div className="mt-5 space-y-5">


              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-[10px] text-gray-500 leading-none">
                    Total Questions
                  </p>
                  <b className="text-xl">
                    {reviewData.question_summary.total_questions}
                  </b>
                </div>


                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-[10px] text-gray-500 leading-none">
                    YES Answers
                  </p>
                  <b className="text-xl text-green-600">
                    {reviewData.question_summary.yes_count}
                  </b>
                </div>


                <div className="rounded-xl bg-red-50 p-4">
                  <p className="text-[10px] text-gray-500 leading-none">
                    NO Answers
                  </p>
                  <b className="text-xl text-red-600">
                    {reviewData.question_summary.no_count}
                  </b>
                </div>


                <div className="rounded-xl bg-purple-50 p-4">
                  <p className="text-[10px] text-gray-500 leading-none">
                    Safeguards
                  </p>
                  <ShieldCheck/>
                </div>


                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-[10px] text-gray-500 leading-none">
                    Conclusion
                  </p>
                  <b>
                    Positive
                  </b>
                </div>

              </div>


              <div className="grid md:grid-cols-4 gap-3">

                <div className="rounded bg-gray-50 p-3">
                  <p className="text-xs">
                    Client
                  </p>
                  <b>
                    {reviewData.client_name}
                  </b>
                </div>


                <div className="rounded bg-gray-50 p-3">
                  <p className="text-xs">
                    Audit
                  </p>
                  <b>
                    {reviewData.audit_name}
                  </b>
                </div>


                <div className="rounded bg-gray-50 p-3">
                  <p className="text-xs">
                    Workflow
                  </p>
                  <b>
                    {reviewData.workflow_status}
                  </b>
                </div>


                <div className="rounded bg-gray-50 p-3">
                  <p className="text-xs">
                    Decision
                  </p>
                  <b>
                    {reviewData.acceptance_decision}
                  </b>
                </div>


              </div>




              <div className="rounded border p-4">

                <h4 className="text-[13px] font-semibold mb-3">
                  Procedure Summary
                </h4>


                <div className="flex gap-4">

                  <span>
                    Total:
                    {" "}
                    {reviewData.question_summary.total_questions}
                  </span>

                  <span className="text-green-600">
                    YES:
                    {" "}
                    {reviewData.question_summary.yes_count}
                  </span>

                  <span className="text-red-600">
                    NO:
                    {" "}
                    {reviewData.question_summary.no_count}
                  </span>

                </div>

              </div>




              <div className="rounded border p-4">

                <h4 className="text-[13px] font-semibold mb-3">
                  Procedure Questions Review Details
                </h4>


                <div className="space-y-2">

                {reviewData.questions.map(q=>(

                  <div
                    key={q.item_id}
                    className="rounded border p-3"
                  >

                    <div className="grid grid-cols-[0.5fr_1.05fr_1.25fr_0.55fr_0.55fr_0.55fr_0.55fr_auto] items-center gap-3 w-full">

                      <b>
                        {q.item_no}
                      </b>


                      <span
                        className={
                          q.answer_value==="yes"
                          ?
                          "text-green-600 text-[13px] font-semibold"
                          :
                          "text-red-600 text-[13px] font-semibold"
                        }
                      >
                        {q.answer_value?.toUpperCase()}
                      </span>


                    </div>


                    <p className="text-sm mt-1">
                      {q.content}
                    </p>


                  </div>

                ))}

                </div>

              </div>




              <div className="rounded border p-4">

                <h4 className="text-[13px] font-semibold leading-none">
                  Safeguards
                </h4>

                <p className="whitespace-pre-line text-sm">
                  {reviewData.safeguards_text}
                </p>

              </div>




              <div className="rounded border p-4">

                <h4 className="text-[13px] font-semibold leading-none">
                  Conclusion
                </h4>

                <p className="whitespace-pre-line text-sm">
                  {reviewData.conclusion_remarks}
                </p>

              </div>




              <div className="flex gap-3">

                {reviewData?.status !== "approved" &&
 reviewData?.status !== "returned" &&
 hasPermission("api.consultation_management.approve") && (
                  <button
                    onClick={()=>
                      onApprove(
                        item.consultation_id
                      )
                    }
                    className="flex gap-2 rounded bg-green-600 px-4 py-2 text-white"
                  >
                    <CheckCircle2 size={16}/>
                    Approve
                  </button>
                )}



                {reviewData?.status !== "approved" &&
 reviewData?.status !== "returned" &&
 hasPermission("api.consultation_management.return") && (
                  <button
                    onClick={()=>{
                      setRejectId(
                        item.consultation_id
                      );
                      setShowRejectModal(true);
                    }}
                    className="flex gap-2 rounded bg-red-600 px-4 py-2 text-white"
                  >
                    <XCircle size={16}/>
                    Reject
                  </button>
                )}

              </div>



            </div>

          )}


      {reviewData && (
  <button
    onClick={onBack}
    className="mt-6 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-gray-700 shadow-md transition hover:bg-gray-50"
  >
    ← Back
  </button>
)}


      {showRejectModal && (


        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <h3 className="text-lg text-[13px] font-semibold">
              Return Consultation Request
            </h3>


            <textarea
              value={remarks}
              onChange={
                e=>setRemarks(
                  e.target.value
                )
              }
              placeholder="Enter return reason"
              className="mt-4 w-full rounded border p-3"
              rows={4}
            />


            <div className="mt-4 flex justify-end gap-3">


              <button
                onClick={()=>{
                  setShowRejectModal(false);
                  setRejectId(null);
                }}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>


              <button
                onClick={()=>{

                  if(!remarks.trim()){
                    alert("Remarks required");
                    return;
                  }


                  if(rejectId){

                    onReturn(
                      rejectId,
                      remarks,
                    );

                  }


                  setRemarks("");
                  setRejectId(null);
                  setShowRejectModal(false);

                }}
                className="rounded bg-red-600 px-4 py-2 text-white"
              >
                Confirm Return
              </button>


            </div>

          </div>

        </div>

      )}


        </div>

      ))}

    </div>

  );

}

















