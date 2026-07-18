# Operational Design Inputs

This note records real-world input that should shape PITT's requirements. It is not a claim that the demo has live fleet, route, dispatch, or regulated-system integrations.

## Patrick Simard: Mapping and Route-Planning Input

### Profile recap

- Friend and reliable business partner of the project owner for more than 25 years.
- Currently drives cross-border and domestic Canadian/US routes for one carrier, including long- and short-distance work.
- Has long-standing hobbyist IT experience rather than a professional software-engineering background.
- Comfortable using AI-assisted development tools, including Claude Code, as his primary coding interface.

### Design role

Patrick is the practical source of truth for what drivers actually need from mapping, routing, stops, offline continuity, and exception handling. His input should challenge product assumptions before they become UI or workflow behavior.

### Steering rules

- Ask first about driver workflow, usable inputs, failure modes, and review points; do not begin from a vendor/API choice.
- Treat routing output as a recommendation with visible assumptions, alternatives, and driver/dispatch review. Never represent it as a command to drive, fuel, or reroute.
- Keep the Build Week demo seeded and deterministic. Record real-data ideas as post-demo requirements, not implied current capability.
- For any future map or route input, require an offline/degraded-mode story, a provenance label, and an explicit limitation when vehicle class, cargo, clearance, road restrictions, or current traffic are unknown.
- Turn confirmed operational observations into test cases or acceptance criteria, not just prose.

## Later Reporting Advisor: Small-Fleet Delivery Operations

### Profile recap

- A separate trusted contact will advise on reporting requirements later.
- Works within a small fleet that delivers a varied mix of cargo, including refrigerated goods and fuel tanker deliveries to gas stations.
- Is not a repository contributor or project participant for this Build Week submission.

### Design role

Use this input only to refine what a human-readable exception report should capture across delivery types: observed event, relevant time/location context, cargo sensitivity, operational impact, uncertainty, driver statement, and required follow-up. Do not infer authority to control regulated systems, collect sensitive fleet data, or claim specialized tanker/refrigerated compliance logic.

## Evidence Discipline

- Label inputs as operational design feedback until independently verified.
- Keep personal details out of the demo, screenshots, prompts, and public submission.
- Distinguish a future integration requirement from a Build Week capability every time.
