# Authentication SDK migration hold

The current production auth implementation is unchanged by the reviewed tooling
batch. Do not infer authentication migration safety from mocked browser QA or
a successful build installed with legacy-peer-deps.

Dependabot #1090 proposes AngularFire 21.0.0. Registry metadata declares peers
Angular 21.2 and TypeScript >=5.8 <6.0, while this application uses Angular 22.2
and TypeScript 6.0.3. The registry latest AngularFire release is also 21.0.0 at
qualification time. That proposal is not a supported coordinated upgrade.

Dependabot #1091 proposes Firebase 13.1.0. Its updated Firebase components declare
Node >=24.12.0 while the repository declares >=22.22.3 and uses Node 22.22.3 in
.node-version. Production and CI runtime support must be aligned before this
SDK migration, including the AngularFire wrapper and its nested Firebase copy.

Targeted version exclusions prevent these proposals recurring while preserving
all current dependency audit and runtime tests. A future compatible AngularFire
release or an explicitly qualified stack migration can remove those holds.
The existing SDK versions are retained; this does not claim their unsupported
peer combinations have been repaired.

Required qualification before integration: supported Angular/TypeScript/Node
peers; exactly understood Firebase app/auth copies; isolated auth-emulator tests
for sign-in, session restoration, sign-out and rejected credentials; production
build and complete frontend/security checks. Use demo projects and synthetic
accounts only, without production identities, Firestore records or customer
credentials. The currently green synthetic browser QA does not replace these
SDK/emulator checks. No live login, auth-rule change or customer-data operation
is part of this batch.
