"""Seed the standard Audit Acceptance Procedures template.

Revision ID: 582919a33092
Revises: cf6eaefed27e
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "582919a33092"
down_revision: str | None = "cf6eaefed27e"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


TEMPLATE_KEY = "client_acceptance_procedures"
TEMPLATE_VERSION = "1.0"
SEED_USER = "migration:582919a33092"


def item(
    item_key: str,
    item_type: str,
    sort_order: int,
    *,
    parent_key: str | None = None,
    item_no: str | None = None,
    title: str | None = None,
    content: str | None = None,
    response_type: str = "none",
    is_required: bool = False,
) -> dict:
    return {
        "item_key": item_key,
        "item_type": item_type,
        "sort_order": sort_order,
        "parent_key": parent_key,
        "item_no": item_no,
        "title": title,
        "content": content,
        "response_type": response_type,
        "is_required": is_required,
    }


ITEMS = (
    item(
        "section_01",
        "section",
        10,
        item_no="1",
        title="Undue dependence on an audit client",
        content=(
            "Do the total fees for this client/group of "
            "clients exceed:"
        ),
    ),
    item(
        "question_01_a_i",
        "question",
        20,
        parent_key="section_01",
        item_no="(a)(i)",
        content=(
            "10 per cent of the annual fee income of the "
            "audit firm or the part of the firm by reference "
            "to which the audit engagement partner's profit "
            "share is calculated?"
        ),
        response_type="yes_no",
    ),
    item(
        "question_01_a_ii",
        "question",
        30,
        parent_key="section_01",
        item_no="(a)(ii)",
        content=(
            "15 per cent of the annual fee income of the "
            "audit firm or the part of the firm by reference "
            "to which the audit engagement partner's profit "
            "share is calculated?"
        ),
        response_type="yes_no",
    ),
    item(
        "question_01_b",
        "question",
        40,
        parent_key="section_01",
        item_no="(b)",
        content=(
            "Is this client/group of clients highly "
            "prestigious?"
        ),
        response_type="yes_no",
    ),
    item(
        "question_01_c",
        "question",
        50,
        parent_key="section_01",
        item_no="(c)",
        content=(
            "Is this client/group a listed or public "
            "interest client or group?"
        ),
        response_type="yes_no",
    ),
    item(
        "note_01",
        "note",
        60,
        parent_key="section_01",
        title="Note",
        content=(
            "1. IFAC Ethical Standards require appropriate "
            "safeguards, for example an external independent "
            "quality control review, where the regular annual "
            "fee income is a significant part of total fees. "
            "The stated percentages of 10% and 15% are "
            "guidelines and would be 5% and 10% respectively "
            "for listed or public interest entities.\n\n"
            "2. A public interest client is one that would "
            "attract national attention if a problem were "
            "publicised."
        ),
    ),
    item(
        "section_02",
        "section",
        70,
        item_no="2",
        title=(
            "Loans to or from a client; guarantees; "
            "overdue fees"
        ),
    ),
    item(
        "question_02_a",
        "question",
        80,
        parent_key="section_02",
        item_no="(a)",
        content=(
            "Do you or any of your staff have any loans or "
            "guarantees to or from the client?"
        ),
        response_type="yes_no",
    ),
    item(
        "question_02_b",
        "question",
        90,
        parent_key="section_02",
        item_no="(b)",
        content=(
            "Are there any overdue fees for any services?"
        ),
        response_type="yes_no",
    ),
    item(
        "section_03",
        "section",
        100,
        item_no="3",
        title="Goods and services: hospitality",
    ),
    item(
        "question_03",
        "question",
        110,
        parent_key="section_03",
        content=(
            "Have you or any of your staff accepted any "
            "material goods or services on favourable terms "
            "or received undue hospitality from the company?"
        ),
        response_type="yes_no",
    ),
    item(
        "section_04",
        "section",
        120,
        item_no="4",
        title="Litigation",
    ),
    item(
        "question_04",
        "question",
        130,
        parent_key="section_04",
        content=(
            "Is there any actual or threatened litigation "
            "between yourself and the client in relation to "
            "fees, audit work, or other work?"
        ),
        response_type="yes_no",
    ),
    item(
        "section_05",
        "section",
        140,
        item_no="5",
        title="Family or other personal relationships",
    ),
    item(
        "question_05",
        "question",
        150,
        parent_key="section_05",
        content=(
            "Do you or any of your staff have any personal "
            "or family connections with the company and its "
            "officers?"
        ),
        response_type="yes_no",
    ),
    item(
        "section_06",
        "section",
        160,
        item_no="6",
        title="Ex-partners or senior employees",
    ),
    item(
        "question_06_a",
        "question",
        170,
        parent_key="section_06",
        item_no="(a)",
        content=(
            "Has any officer of the company been a partner "
            "or senior employee in the practice?"
        ),
        response_type="yes_no",
    ),
    item(
        "question_06_b",
        "question",
        180,
        parent_key="section_06",
        item_no="(b)",
        content=(
            "Is the partner or any senior employee on the "
            "audit joining or involved in substantive "
            "negotiations with the client?"
        ),
        response_type="yes_no",
    ),
    item(
        "section_07",
        "section",
        190,
        item_no="7",
        title="Mutual business interest",
    ),
    item(
        "question_07",
        "question",
        200,
        parent_key="section_07",
        content=(
            "Do you or any of your partners or staff have "
            "any mutual business interests with the client "
            "or with an officer or employee of the client?"
        ),
        response_type="yes_no",
    ),
    item(
        "section_08",
        "section",
        210,
        item_no="8",
        title="Beneficial interests and trusteeships",
        content=(
            "Do you or any of your staff have any financial "
            "involvement in the company in respect of the "
            "following:"
        ),
    ),
    item(
        "question_08_a",
        "question",
        220,
        parent_key="section_08",
        item_no="(a)",
        content=(
            "Any beneficial interest in shares or other "
            "investments?"
        ),
        response_type="yes_no",
    ),
    item(
        "question_08_b",
        "question",
        230,
        parent_key="section_08",
        item_no="(b)",
        content="Any beneficial interest in trusts?",
        response_type="yes_no",
    ),
    item(
        "question_08_c",
        "question",
        240,
        parent_key="section_08",
        item_no="(c)",
        content=(
            "Any trustee investments, nominee shareholdings "
            "or 'bare trustee' shareholdings?"
        ),
        response_type="yes_no",
    ),
    item(
        "question_08_d",
        "question",
        250,
        parent_key="section_08",
        item_no="(d)",
        content=(
            "Any trusteeships in a trust that holds shares "
            "in an audit client?"
        ),
        response_type="yes_no",
    ),
    item(
        "section_09",
        "section",
        260,
        item_no="9",
        title="Associated firms",
    ),
    item(
        "question_09",
        "question",
        270,
        parent_key="section_09",
        content=(
            "Are you or your staff associated with any other "
            "practice or organisation which has any dealings "
            "with the company?"
        ),
        response_type="yes_no",
    ),
    item(
        "section_10",
        "section",
        280,
        item_no="10",
        title=(
            "Provision of other services, specialist "
            "valuations and advocacy"
        ),
    ),
    item(
        "note_10_network_firm",
        "note",
        290,
        parent_key="section_10",
        title="Network firm",
        content=(
            "A network firm is any entity that is:\n"
            "(i) controlled by the audit firm; or\n"
            "(ii) under common control, ownership or "
            "management; or\n"
            "(iii) otherwise affiliated or associated with "
            "the audit firm through the use of a common name "
            "or through the sharing of significant common "
            "professional resources."
        ),
    ),
    item(
        "question_10_a",
        "question",
        300,
        parent_key="section_10",
        item_no="(a)",
        content=(
            "Are any services in relation to the management "
            "of the company performed by the firm?"
        ),
        response_type="yes_no",
    ),
    item(
        "question_10_b",
        "question",
        310,
        parent_key="section_10",
        item_no="(b)",
        content=(
            "Are any accounting services performed for the "
            "company, such as preparation of the statutory "
            "accounts from trial balance, bookkeeping or "
            "payroll services?"
        ),
        response_type="yes_no",
    ),
    item(
        "question_10_c",
        "question",
        320,
        parent_key="section_10",
        item_no="(c)",
        content=(
            "Do the accounts include any specialist "
            "valuations carried out by the firm or a network "
            "firm?"
        ),
        response_type="yes_no",
    ),
    item(
        "question_10_d",
        "question",
        330,
        parent_key="section_10",
        item_no="(d)",
        content=(
            "Are the firm or a network firm currently acting "
            "for the client as an advocate in any adversarial "
            "proceeding or situation, such as a hearing "
            "before the Commissioners?"
        ),
        response_type="yes_no",
    ),
    item(
        "question_10_e",
        "question",
        340,
        parent_key="section_10",
        item_no="(e)",
        content=(
            "Has the firm or a network firm been involved in "
            "the design, provision or implementation of any "
            "IT systems?"
        ),
        response_type="yes_no",
    ),
    item(
        "question_10_f",
        "question",
        350,
        parent_key="section_10",
        item_no="(f)",
        content=(
            "Does the firm or a network firm provide advice "
            "on taxation matters or undertake tax compliance "
            "work for the client?"
        ),
        response_type="yes_no",
    ),
    item(
        "section_10_g",
        "note",
        360,
        parent_key="section_10",
        item_no="(g)",
        content=(
            "Does the firm or a network firm provide the "
            "following services as identified in Corporate "
            "Governance Guidelines issued by BSEC:"
        ),
    ),
    item(
        "question_10_g_i",
        "question",
        370,
        parent_key="section_10",
        item_no="(g)(i)",
        content=(
            "Appraisal or valuation services or fairness "
            "opinion?"
        ),
        response_type="yes_no",
    ),
    item(
        "question_10_g_ii",
        "question",
        380,
        parent_key="section_10",
        item_no="(g)(ii)",
        content=(
            "Financial information systems design and "
            "implementation?"
        ),
        response_type="yes_no",
    ),
    item(
        "question_10_g_iii",
        "question",
        390,
        parent_key="section_10",
        item_no="(g)(iii)",
        content="Actuarial services?",
        response_type="yes_no",
    ),
    item(
        "question_10_g_iv",
        "question",
        400,
        parent_key="section_10",
        item_no="(g)(iv)",
        content="Internal audit?",
        response_type="yes_no",
    ),
    item(
        "question_10_h",
        "question",
        410,
        parent_key="section_10",
        item_no="(h)",
        content=(
            "Have any other services been provided to the "
            "client that may cause a threat to the firm's "
            "objectivity or independence?"
        ),
        response_type="yes_no",
    ),
    item(
        "section_11",
        "section",
        420,
        item_no="11",
        title="Rotation of audit engagement partner",
    ),
    item(
        "question_11",
        "question",
        430,
        parent_key="section_11",
        content=(
            "Have you been acting as the audit engagement "
            "partner for more than three years?"
        ),
        response_type="yes_no",
    ),
    item(
        "section_12",
        "section",
        440,
        item_no="12",
        title="Adequate resources",
    ),
    item(
        "question_12_a",
        "question",
        450,
        parent_key="section_12",
        item_no="(a)",
        content=(
            "Are there any indications that the engagement "
            "team is not competent or does not have the "
            "necessary time and resources?"
        ),
        response_type="yes_no",
    ),
    item(
        "question_12_b",
        "question",
        460,
        parent_key="section_12",
        item_no="(b)",
        content=(
            "Are there any indications that the firm or "
            "engagement team will not be able to demonstrate "
            "compliance with ethical requirements?"
        ),
        response_type="yes_no",
    ),
    item(
        "section_13",
        "section",
        470,
        item_no="13",
        title="Proper performance",
    ),
    item(
        "question_13_a",
        "question",
        480,
        parent_key="section_13",
        item_no="(a)",
        content=(
            "Are there any aspects of the client, or other "
            "factors, that will adversely affect the firm's "
            "ability to perform the audit properly?"
        ),
        response_type="yes_no",
    ),
    item(
        "question_13_b",
        "question",
        490,
        parent_key="section_13",
        item_no="(b)",
        content=(
            "Are there any issues concerning the integrity "
            "of the principal owners, key management or "
            "those charged with governance of the entity?"
        ),
        response_type="yes_no",
    ),
    item(
        "safeguards",
        "safeguard",
        500,
        title="Safeguards",
        content=(
            "Where any of the above questions have been "
            "answered 'yes', specify what safeguards are "
            "proposed to maintain integrity and independence, "
            "and to ensure the availability of resources and "
            "the ability to perform the audit properly."
        ),
    ),
    item(
        "safeguards_existing_statement",
        "safeguard",
        510,
        parent_key="safeguards",
        content=(
            "We do not engage the staffs, which have Family "
            "or other personal relationships with the client."
        ),
    ),
    item(
        "conclusion",
        "conclusion",
        520,
        title="Conclusion",
        content=(
            "Having regard to any safeguards identified "
            "above, I am satisfied that appropriate "
            "procedures regarding the acceptance and "
            "continuance of this client relationship and "
            "audit engagement have been followed, and that "
            "the conclusions reached in this regard are "
            "appropriate and have been properly documented. "
            "In arriving at this conclusion I confirm that "
            "I have:\n\n"
            "(a) obtained all relevant information from the "
            "firm and, where applicable, network firms to "
            "identify and evaluate circumstances and "
            "relationships that may create a threat to "
            "independence;\n"
            "(b) evaluated information on identified "
            "breaches, if any, of the firm's independence "
            "policies and procedures to determine whether "
            "they create a threat to independence for this "
            "audit engagement;\n"
            "(c) taken appropriate action to eliminate such "
            "threats or reduce them to an acceptable level "
            "by applying safeguards;\n"
            "(d) documented the conclusion on independence "
            "and any relevant discussions within the firm "
            "that support this view; and\n"
            "(e) informed the client of all significant "
            "facts and matters that bear upon the firm's "
            "objectivity and independence."
        ),
    ),
    item(
        "conclusion_opinion",
        "conclusion",
        530,
        content=(
            "In my opinion the steps proposed are sufficient "
            "to maintain independence and to ensure the "
            "availability of resources and the ability to "
            "perform the audit properly."
        ),
    ),
    item(
        "signature_partner",
        "signature",
        540,
        title="Partner",
        content="Hannan Molla FCMA, FCA",
    ),
    item(
        "signature_consultation",
        "signature",
        550,
        title="Consultation",
        content="To be completed where appropriate.",
    ),
    item(
        "signature_second_partner",
        "signature",
        560,
        title="Second Partner",
        content="Ishrat Zebeen ACA",
    ),
)


def upgrade() -> None:
    conn = op.get_bind()

    template_id = conn.execute(
        sa.text(
            """
            INSERT INTO audit_accept_templates
            (
                template_key,
                template_name,
                reference_no,
                version,
                intro_text,
                effective_from,
                effective_to,
                is_active,
                created_by,
                updated_by,
                created_at,
                updated_at
            )
            VALUES
            (
                :template_key,
                :template_name,
                :reference_no,
                :version,
                :intro_text,
                NULL,
                NULL,
                true,
                :seed_user,
                :seed_user,
                now(),
                now()
            )
            ON CONFLICT (template_key, version)
            DO UPDATE SET
                template_name = EXCLUDED.template_name,
                reference_no = EXCLUDED.reference_no,
                intro_text = EXCLUDED.intro_text,
                effective_from = EXCLUDED.effective_from,
                effective_to = EXCLUDED.effective_to,
                is_active = true,
                updated_by = EXCLUDED.updated_by,
                updated_at = now()
            RETURNING template_id
            """
        ),
        {
            "template_key": TEMPLATE_KEY,
            "template_name": "Acceptance Procedures",
            "reference_no": "C1.1",
            "version": TEMPLATE_VERSION,
            "seed_user": SEED_USER,
            "intro_text": (
                'Companies Act 1994 requires that "a Chartered '
                "Accountant shall not accept appointment or "
                "continue as auditor if the firm has any "
                "interest likely to conflict with carrying "
                'out the audit properly" and ISA 200.14 '
                "requires compliance with ICAB and IFAC Code "
                "of Ethics.\n\n"
                "This questionnaire assumes a knowledge of "
                "ICAB/IFAC Code of Ethics. It must be "
                "completed annually for all clients to ensure "
                "that the standards have been complied with."
            ),
        },
    ).scalar_one()

    item_ids: dict[str, int] = {}

    for record in ITEMS:
        parent_key = record["parent_key"]
        parent_item_id = (
            item_ids[parent_key]
            if parent_key is not None
            else None
        )

        item_id = conn.execute(
            sa.text(
                """
                INSERT INTO audit_accept_items
                (
                    template_id,
                    parent_item_id,
                    item_type,
                    item_key,
                    item_no,
                    title,
                    content,
                    response_type,
                    sort_order,
                    is_required,
                    is_active,
                    created_by,
                    updated_by,
                    created_at,
                    updated_at
                )
                VALUES
                (
                    :template_id,
                    :parent_item_id,
                    :item_type,
                    :item_key,
                    :item_no,
                    :title,
                    :content,
                    :response_type,
                    :sort_order,
                    :is_required,
                    true,
                    :seed_user,
                    :seed_user,
                    now(),
                    now()
                )
                ON CONFLICT (template_id, item_key)
                DO UPDATE SET
                    parent_item_id = EXCLUDED.parent_item_id,
                    item_type = EXCLUDED.item_type,
                    item_no = EXCLUDED.item_no,
                    title = EXCLUDED.title,
                    content = EXCLUDED.content,
                    response_type = EXCLUDED.response_type,
                    sort_order = EXCLUDED.sort_order,
                    is_required = EXCLUDED.is_required,
                    is_active = true,
                    updated_by = EXCLUDED.updated_by,
                    updated_at = now()
                RETURNING item_id
                """
            ),
            {
                **record,
                "template_id": template_id,
                "parent_item_id": parent_item_id,
                "seed_user": SEED_USER,
            },
        ).scalar_one()

        item_ids[record["item_key"]] = item_id


def downgrade() -> None:
    conn = op.get_bind()

    template_ids = conn.execute(
        sa.text(
            """
            SELECT template_id
            FROM audit_accept_templates
            WHERE template_key = :template_key
              AND version = :version
            """
        ),
        {
            "template_key": TEMPLATE_KEY,
            "version": TEMPLATE_VERSION,
        },
    ).scalars().all()

    if not template_ids:
        return

    conn.execute(
        sa.text(
            """
            DELETE FROM audit_accept_responses
            WHERE template_id = ANY(:template_ids)
            """
        ),
        {"template_ids": template_ids},
    )

    conn.execute(
        sa.text(
            """
            DELETE FROM audit_accept_items
            WHERE template_id = ANY(:template_ids)
            """
        ),
        {"template_ids": template_ids},
    )

    conn.execute(
        sa.text(
            """
            DELETE FROM audit_accept_templates
            WHERE template_id = ANY(:template_ids)
            """
        ),
        {"template_ids": template_ids},
    )