import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { SEED_PRACTICE_DATA_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const DAY = 86_400_000;

const at = (daysFromNow: number, hour = 10): string => {
  const date = new Date(Date.now() + daysFromNow * DAY);

  date.setUTCHours(hour, 0, 0, 0);

  return date.toISOString();
};

const onDay = (daysFromNow: number): string => at(daysFromNow).slice(0, 10);

type SeedClient = {
  first: string;
  last: string;
  thaiFirst?: string;
  thaiLast?: string;
  email: string;
  phone: string;
  organization?: string;
};

type SeedOrganization = { name: string; nameTh?: string };

type SeedJob = {
  name: string;
  client: string;
  organization?: string;
  entity: string;
  typeOfWork: string;
  stage: string;
  openedDaysAgo: number;
  deadlines: {
    title: string;
    inDays: number;
    deadlineType: string;
    isCritical?: boolean;
    done?: boolean;
  }[];
  documents: { name: string; status: string }[];
  bookings: { title: string; inDays: number; service: string; status: string }[];
  workLogs: { description: string; daysAgo: number; minutes: number }[];
};

const ORGANIZATIONS: SeedOrganization[] = [
  { name: 'Siam Orchid Property', nameTh: 'บริษัท สยามออร์คิด พร็อพเพอร์ตี้ จำกัด' },
  { name: 'Andaman Marine Services', nameTh: 'บริษัท อันดามัน มารีน เซอร์วิส จำกัด' },
  { name: 'Baltic Trading', nameTh: undefined },
];

const CLIENTS: SeedClient[] = [
  {
    first: 'Somchai',
    last: 'Prasert',
    thaiFirst: 'สมชาย',
    thaiLast: 'ประเสริฐ',
    email: 'somchai.prasert@example.co.th',
    phone: '+66 81 234 5678',
    organization: 'Siam Orchid Property',
  },
  {
    first: 'Naruemon',
    last: 'Chaiyaporn',
    thaiFirst: 'นฤมล',
    thaiLast: 'ชัยพร',
    email: 'naruemon.c@example.co.th',
    phone: '+66 89 887 1120',
  },
  {
    first: 'Wichai',
    last: 'Thongdee',
    thaiFirst: 'วิชัย',
    thaiLast: 'ทองดี',
    email: 'wichai.thongdee@example.co.th',
    phone: '+66 92 445 7781',
    organization: 'Andaman Marine Services',
  },
  {
    first: 'Peter',
    last: 'Lindqvist',
    email: 'p.lindqvist@example.se',
    phone: '+46 70 555 2211',
    organization: 'Baltic Trading',
  },
  {
    first: 'Margaret',
    last: 'Ellery',
    email: 'm.ellery@example.co.uk',
    phone: '+44 7700 900321',
  },
  {
    first: 'Dieter',
    last: 'Hoffmann',
    email: 'd.hoffmann@example.de',
    phone: '+49 151 2345678',
  },
];

// Twenty's seeded "create a company on new person" workflow will override every
// companyId here with one derived from the email domain, and mint the
// organization to go with it. Turn that workflow off before seeding; see the
// README. It fires on create only, so corrections afterwards hold.

// One job per shape worth seeing: overdue, due today, waiting on the client,
// finished, and one that has barely started.
const JOBS: SeedJob[] = [
  {
    name: 'Retirement visa extension, Hoffmann',
    client: 'Dieter Hoffmann',
    entity: 'Thailiving Law',
    typeOfWork: 'Visa and immigration',
    stage: 'MEETING',
    openedDaysAgo: 24,
    deadlines: [
      { title: 'Extension must be filed', inDays: -2, deadlineType: 'STATUTORY', isCritical: true },
      { title: '90-day report', inDays: 21, deadlineType: 'STATUTORY' },
    ],
    documents: [
      { name: 'Passport, photo page', status: 'VERIFIED' },
      { name: 'Bank letter, 800,000 THB', status: 'REQUESTED' },
      { name: 'TM30 receipt', status: 'RECEIVED' },
    ],
    bookings: [
      { title: 'Immigration office, Jomtien', inDays: 1, service: 'FOLLOW_UP', status: 'CONFIRMED' },
    ],
    workLogs: [
      { description: 'Checked bank letter wording against current requirement', daysAgo: 2, minutes: 25 },
    ],
  },
  {
    name: 'Condo transfer, Ellery to Prasert',
    client: 'Margaret Ellery',
    entity: 'Thailiving Law',
    typeOfWork: 'Property',
    stage: 'PROPOSAL',
    openedDaysAgo: 11,
    deadlines: [
      { title: 'Land office appointment', inDays: 0, deadlineType: 'CLIENT_COMMITTED', isCritical: true },
      { title: 'Foreign exchange form to bank', inDays: 5, deadlineType: 'STATUTORY' },
    ],
    documents: [
      { name: 'Title deed (chanote)', status: 'VERIFIED' },
      { name: 'Foreign exchange transaction form', status: 'REQUESTED' },
      { name: 'Condominium debt-free certificate', status: 'REQUESTED' },
    ],
    bookings: [
      { title: 'Land office, Banglamung', inDays: 0, service: 'SIGNING', status: 'CONFIRMED' },
    ],
    workLogs: [
      { description: 'Title search at land office', daysAgo: 4, minutes: 95 },
      { description: 'Drafted sale agreement, both languages', daysAgo: 3, minutes: 140 },
    ],
  },
  {
    name: 'Company registration, Andaman Marine',
    client: 'Wichai Thongdee',
    organization: 'Andaman Marine Services',
    entity: 'Unique X Services',
    typeOfWork: 'Company registration',
    stage: 'CUSTOMER',
    openedDaysAgo: 40,
    deadlines: [
      { title: 'DBD filing', inDays: -18, deadlineType: 'STATUTORY', done: true },
      { title: 'VAT registration', inDays: 9, deadlineType: 'STATUTORY' },
    ],
    documents: [
      { name: 'Shareholder ID cards', status: 'VERIFIED' },
      { name: 'Office lease agreement', status: 'VERIFIED' },
      { name: 'Company seal artwork', status: 'RECEIVED' },
    ],
    bookings: [],
    workLogs: [
      { description: 'Name reservation and objection check', daysAgo: 30, minutes: 45 },
      { description: 'Filed registration at DBD', daysAgo: 18, minutes: 180 },
    ],
  },
  {
    name: 'Notarisation, Lindqvist power of attorney',
    client: 'Peter Lindqvist',
    organization: 'Baltic Trading',
    entity: 'Pattaya Notary',
    typeOfWork: 'Notarization',
    stage: 'NEW',
    openedDaysAgo: 2,
    deadlines: [
      { title: 'Client travelling, must sign before', inDays: 3, deadlineType: 'CLIENT_COMMITTED', isCritical: true },
    ],
    documents: [{ name: 'Draft power of attorney', status: 'RECEIVED' }],
    bookings: [
      { title: 'Signing at office', inDays: 2, service: 'NOTARIZATION', status: 'REQUESTED' },
    ],
    workLogs: [],
  },
  {
    name: 'Will and estate, Chaiyaporn',
    client: 'Naruemon Chaiyaporn',
    entity: 'Thailiving Law',
    typeOfWork: 'Estate and wills',
    stage: 'SCREENING',
    openedDaysAgo: 6,
    deadlines: [
      { title: 'Draft to client for review', inDays: 4, deadlineType: 'INTERNAL' },
    ],
    documents: [
      { name: 'List of assets', status: 'REQUESTED' },
      { name: 'House registration (tabien baan)', status: 'REQUESTED' },
    ],
    bookings: [
      { title: 'Second consultation', inDays: 4, service: 'FOLLOW_UP', status: 'CONFIRMED' },
    ],
    workLogs: [
      { description: 'First consultation, took instructions', daysAgo: 6, minutes: 60 },
    ],
  },
  {
    name: 'Lease dispute, Siam Orchid',
    client: 'Somchai Prasert',
    organization: 'Siam Orchid Property',
    entity: 'Thailiving Law',
    typeOfWork: 'Litigation',
    stage: 'MEETING',
    openedDaysAgo: 65,
    deadlines: [
      { title: 'File defence', inDays: 12, deadlineType: 'COURT', isCritical: true },
      { title: 'Court hearing', inDays: 34, deadlineType: 'COURT', isCritical: true },
    ],
    documents: [
      { name: 'Lease agreement, signed', status: 'VERIFIED' },
      { name: 'Payment history', status: 'RECEIVED' },
      { name: 'Correspondence with tenant', status: 'REQUESTED' },
    ],
    bookings: [],
    workLogs: [
      { description: 'Reviewed lease and payment history', daysAgo: 9, minutes: 165 },
      { description: 'Call with client about settlement range', daysAgo: 1, minutes: 30 },
    ],
  },
];

type Lookup = Map<string, string>;

const idFrom = (result: unknown, key: string): string | undefined =>
  (result as Record<string, { id?: string } | undefined>)[key]?.id;

const handler = async (): Promise<{
  organizations: number;
  clients: number;
  jobs: number;
  deadlines: number;
  documents: number;
  bookings: number;
  workLogs: number;
  skipped: string[];
}> => {
  const client = new CoreApiClient();
  const skipped: string[] = [];

  const entities = (await client.query({
    billingEntities: { edges: { node: { id: true, name: true } } },
  })) as { billingEntities?: { edges?: { node?: { id?: string; name?: string } }[] } };

  const entityByName: Lookup = new Map();

  for (const edge of entities.billingEntities?.edges ?? []) {
    if (edge.node?.name && edge.node.id) {
      entityByName.set(edge.node.name, edge.node.id);
    }
  }

  const areas = (await client.query({
    practiceAreas: { edges: { node: { id: true, name: true } } },
  })) as { practiceAreas?: { edges?: { node?: { id?: string; name?: string } }[] } };

  const areaByName: Lookup = new Map();

  for (const edge of areas.practiceAreas?.edges ?? []) {
    if (edge.node?.name && edge.node.id) {
      areaByName.set(edge.node.name, edge.node.id);
    }
  }

  if (entityByName.size === 0 || areaByName.size === 0) {
    return {
      organizations: 0, clients: 0, jobs: 0, deadlines: 0,
      documents: 0, bookings: 0, workLogs: 0,
      skipped: ['Run the post-install hook first: it seeds the entities and the types of work.'],
    };
  }

  const members = (await client.query({
    workspaceMembers: { edges: { node: { id: true } } },
  })) as { workspaceMembers?: { edges?: { node?: { id?: string } }[] } };

  const memberIds = (members.workspaceMembers?.edges ?? [])
    .map((edge) => edge.node?.id)
    .filter((id): id is string => id !== undefined);

  const organizationByName: Lookup = new Map();
  let organizations = 0;

  for (const organization of ORGANIZATIONS) {
    const created = await client.mutation({
      createCompany: {
        __args: {
          data: {
            name: organization.name,
            ...(organization.nameTh !== undefined ? { nameTh: organization.nameTh } : {}),
          },
        },
        id: true,
      },
    });
    const id = idFrom(created, 'createCompany');

    if (id !== undefined) {
      organizationByName.set(organization.name, id);
      organizations += 1;
    }
  }

  const clientByName: Lookup = new Map();
  let clients = 0;

  for (const person of CLIENTS) {
    const organizationId = person.organization
      ? organizationByName.get(person.organization)
      : undefined;

    const created = await client.mutation({
      createPerson: {
        __args: {
          data: {
            name: { firstName: person.first, lastName: person.last },
            ...(person.thaiFirst !== undefined
              ? { nameTh: { firstName: person.thaiFirst, lastName: person.thaiLast } }
              : {}),
            emails: { primaryEmail: person.email },
            phones: { primaryPhoneNumber: person.phone },
            ...(organizationId !== undefined ? { companyId: organizationId } : {}),
          },
        },
        id: true,
      },
    });
    const id = idFrom(created, 'createPerson');

    if (id !== undefined) {
      clientByName.set(`${person.first} ${person.last}`, id);
      clients += 1;
    }
  }

  let jobs = 0;
  let deadlines = 0;
  let documents = 0;
  let bookings = 0;
  let workLogs = 0;

  for (const [index, job] of JOBS.entries()) {
    const billingEntityId = entityByName.get(job.entity);
    const practiceAreaId = areaByName.get(job.typeOfWork);
    const personId = clientByName.get(job.client);
    const companyId = job.organization
      ? organizationByName.get(job.organization)
      : undefined;

    if (billingEntityId === undefined || practiceAreaId === undefined) {
      skipped.push(job.name);
      continue;
    }

    const createdJob = await client.mutation({
      createOpportunity: {
        __args: {
          data: {
            name: job.name,
            stage: job.stage,
            billingEntityId,
            practiceAreaId,
            openedAt: at(-job.openedDaysAgo),
            ...(personId !== undefined ? { pointOfContactId: personId } : {}),
            ...(companyId !== undefined ? { companyId } : {}),
          },
        },
        id: true,
      },
    });
    const matterId = idFrom(createdJob, 'createOpportunity');

    if (matterId === undefined) {
      skipped.push(job.name);
      continue;
    }

    jobs += 1;

    // Round-robin so the firm's views do not all belong to one person.
    const responsibleId = memberIds[index % Math.max(memberIds.length, 1)];

    for (const deadline of job.deadlines) {
      await client.mutation({
        createMatterDeadline: {
          __args: {
            data: {
              title: deadline.title,
              dueAt: at(deadline.inDays),
              deadlineType: deadline.deadlineType,
              isCritical: deadline.isCritical === true,
              ...(deadline.done === true ? { completedAt: at(deadline.inDays + 1) } : {}),
              matterId,
              ...(responsibleId !== undefined ? { responsibleId } : {}),
            },
          },
          id: true,
        },
      });
      deadlines += 1;
    }

    for (const document of job.documents) {
      await client.mutation({
        createRequiredDocument: {
          __args: {
            data: {
              name: document.name,
              status: document.status,
              requestedAt: at(-job.openedDaysAgo + 1),
              ...(document.status === 'REQUESTED' ? {} : { receivedAt: at(-2) }),
              matterId,
            },
          },
          id: true,
        },
      });
      documents += 1;
    }

    for (const booking of job.bookings) {
      await client.mutation({
        createBooking: {
          __args: {
            data: {
              title: booking.title,
              startsAt: at(booking.inDays, 9),
              endsAt: at(booking.inDays, 10),
              status: booking.status,
              service: booking.service,
              location: 'OFFICE',
              matterId,
              billingEntityId,
              ...(personId !== undefined ? { personId } : {}),
              ...(responsibleId !== undefined ? { responsibleId } : {}),
            },
          },
          id: true,
        },
      });
      bookings += 1;
    }

    for (const log of job.workLogs) {
      await client.mutation({
        createWorkLog: {
          __args: {
            data: {
              description: log.description,
              workedOn: onDay(-log.daysAgo),
              minutes: log.minutes,
              isBillable: true,
              matterId,
              billingEntityId,
              ...(responsibleId !== undefined ? { staffId: responsibleId } : {}),
            },
          },
          id: true,
        },
      });
      workLogs += 1;
    }
  }

  return { organizations, clients, jobs, deadlines, documents, bookings, workLogs, skipped };
};

export default defineLogicFunction({
  universalIdentifier: SEED_PRACTICE_DATA_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'seed-practice-data',
  handler,
});
