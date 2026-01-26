# Frontend Integration Guide: Report Editing Feature

## ✅ Deployment Status

- **Database Migration:** ✅ Applied successfully
- **Backend Services:** ✅ Restarted and running
- **New API Endpoints:** ✅ Deployed and available
- **Tests:** ✅ **11/11 passing** (100% success rate)

---

## 🎯 Feature Overview

Users can now **edit clinical content** of generated radiology reports before exporting to DOCX. Changes persist in Redis for 24 hours and edit history is tracked for compliance.

### What Can Be Edited
- **Findings** (max 50KB)
- **Impression** (max 50KB)
- **Recommendations** (max 10KB)

### What Cannot Be Edited (Read-Only)
- Title
- Technique
- Patient identifiers (HIPAA compliance)
- LLM metadata (provenance tracking)

### Key Benefits
- ✅ Free for all tiers (no quota consumption)
- ✅ Full audit trail for compliance
- ✅ Edits persist across sessions (24h)
- ✅ No changes to existing export flow

---

## 📡 New API Endpoints

### 1. PATCH /v1/reports/{job_id} (REQUIRED)
Save edited report content.

**Authentication:** JWT token required (`Authorization: Bearer <token>`)
**Rate Limit:** 30 requests/minute

**Request:**
```json
{
  "findings": "Bilateral infiltrates noted in lower lobes",
  "impression": "Pneumonia likely",
  "recommendations": "Follow-up chest CT in 2 weeks"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "job_id": "abc123",
  "edited_fields": ["findings", "impression", "recommendations"],
  "edited_at": "2026-01-25T23:00:00Z",
  "message": "Successfully edited 3 field(s)"
}
```

**Response (No Changes):**
```json
{
  "success": true,
  "job_id": "abc123",
  "edited_fields": [],
  "edited_at": "2026-01-25T23:00:00Z",
  "message": "No changes detected"
}
```

**Error Responses:**
- `404` - Report not found or data expired (regenerate required)
- `403` - User does not own this report
- `422` - Validation error (empty fields or max length exceeded)
- `500` - Server error

**cURL Example:**
```bash
curl -X PATCH https://api.radly.app/v1/reports/abc123 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "findings": "Updated findings",
    "impression": "Updated impression",
    "recommendations": "Updated recommendations"
  }'
```

---

### 2. GET /v1/reports/{job_id}/edited (OPTIONAL)
Retrieve edited version of report if it exists.

**Authentication:** JWT token required
**Rate Limit:** 60 requests/minute

**Response (200 OK):**
```json
{
  "job_id": "abc123",
  "report": {
    "title": "CT Chest with Contrast",
    "technique": "Axial CT images...",
    "findings": "Edited findings here",
    "impression": "Edited impression",
    "recommendations": "Edited recommendations"
  },
  "edited_at": "2026-01-25T23:00:00Z",
  "edited_by": "user-uuid",
  "edited_fields": ["findings", "impression"]
}
```

**Error Response:**
- `404` - No edited version found (report never edited)

---

### 3. GET /v1/reports/{job_id}/edit-status (OPTIONAL)
Check if report has been edited.

**Authentication:** JWT token required
**Rate Limit:** 60 requests/minute

**Response (200 OK - Edited):**
```json
{
  "job_id": "abc123",
  "has_been_edited": true,
  "edited_at": "2026-01-25T23:00:00Z"
}
```

**Response (200 OK - Not Edited):**
```json
{
  "job_id": "abc123",
  "has_been_edited": false,
  "edited_at": null
}
```

---

## 🌐 Web App Integration Prompt

```markdown
# Web App: Implement Report Editing Feature

## Overview
Add ability for users to edit findings, impression, and recommendations of generated radiology reports before exporting to DOCX.

## Backend API Endpoints
- **PATCH /v1/reports/{job_id}** - Save edited report
- **POST /v1/export/docx/link** - Export report (existing endpoint, no changes needed)

## Implementation Steps

### 1. Add Edit UI Component

Create `ReportEditForm.tsx`:

```tsx
import { useState } from 'react';
import { TextField, Button, Stack, Alert } from '@mui/material';

interface Report {
  title: string;
  technique: string;
  findings: string;
  impression: string;
  recommendations: string;
}

interface ReportEditFormProps {
  originalReport: Report;
  jobId: string;
  jwt: string;
  onSaveSuccess: () => void;
  onExport: (editedReport: Report) => void;
}

export function ReportEditForm({
  originalReport,
  jobId,
  jwt,
  onSaveSuccess,
  onExport
}: ReportEditFormProps) {
  const [editedReport, setEditedReport] = useState({
    findings: originalReport.findings,
    impression: originalReport.impression,
    recommendations: originalReport.recommendations
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const hasChanges =
    editedReport.findings !== originalReport.findings ||
    editedReport.impression !== originalReport.impression ||
    editedReport.recommendations !== originalReport.recommendations;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch(`/v1/reports/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          findings: editedReport.findings,
          impression: editedReport.impression,
          recommendations: editedReport.recommendations || undefined
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Report expired. Please regenerate the report.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to edit this report.');
        } else if (response.status === 422) {
          throw new Error('Please check that all fields are filled correctly.');
        } else {
          throw new Error('Failed to save changes. Please try again.');
        }
      }

      const data = await response.json();
      setSaveSuccess(true);
      onSaveSuccess();

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    // Build complete report with edited content
    const fullReport: Report = {
      title: originalReport.title,
      technique: originalReport.technique,
      findings: editedReport.findings,
      impression: editedReport.impression,
      recommendations: editedReport.recommendations
    };

    onExport(fullReport);
  };

  return (
    <Stack spacing={3}>
      {saveError && (
        <Alert severity="error" onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}

      {saveSuccess && (
        <Alert severity="success" onClose={() => setSaveSuccess(false)}>
          ✓ Changes saved successfully
        </Alert>
      )}

      <TextField
        label="Findings"
        value={editedReport.findings}
        onChange={(e) => setEditedReport({ ...editedReport, findings: e.target.value })}
        multiline
        rows={8}
        fullWidth
        disabled={isSaving}
        inputProps={{ maxLength: 50000 }}
        helperText={`${editedReport.findings.length}/50,000 characters`}
      />

      <TextField
        label="Impression"
        value={editedReport.impression}
        onChange={(e) => setEditedReport({ ...editedReport, impression: e.target.value })}
        multiline
        rows={6}
        fullWidth
        disabled={isSaving}
        inputProps={{ maxLength: 50000 }}
        helperText={`${editedReport.impression.length}/50,000 characters`}
      />

      <TextField
        label="Recommendations (optional)"
        value={editedReport.recommendations}
        onChange={(e) => setEditedReport({ ...editedReport, recommendations: e.target.value })}
        multiline
        rows={4}
        fullWidth
        disabled={isSaving}
        inputProps={{ maxLength: 10000 }}
        helperText={`${editedReport.recommendations.length}/10,000 characters`}
      />

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          variant="outlined"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>

        <Button
          onClick={handleExport}
          disabled={isSaving}
          variant="contained"
        >
          Export to DOCX
        </Button>
      </Stack>
    </Stack>
  );
}
```

### 2. Update Report View Page

Add edit mode to your existing report display:

```tsx
import { useState } from 'react';
import { ReportEditForm } from './ReportEditForm';
import { exportReport } from './exportService';

function ReportViewPage({ report, jobId, jwt }) {
  const [isEditMode, setIsEditMode] = useState(false);

  const handleExport = async (editedReport) => {
    try {
      const response = await fetch('/v1/export/docx/link', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          report: editedReport,
          patient: report.patient,
          signature: report.signature,
          include_identifiers: true
        })
      });

      const { document_url } = await response.json();

      // Download DOCX
      window.location.href = document_url;
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report');
    }
  };

  return (
    <div>
      {!isEditMode ? (
        <>
          <ReportDisplay report={report} />
          <Button onClick={() => setIsEditMode(true)}>
            Edit Report
          </Button>
        </>
      ) : (
        <>
          <Button onClick={() => setIsEditMode(false)}>
            Cancel Editing
          </Button>
          <ReportEditForm
            originalReport={report}
            jobId={jobId}
            jwt={jwt}
            onSaveSuccess={() => {
              console.log('Report saved!');
            }}
            onExport={handleExport}
          />
        </>
      )}
    </div>
  );
}
```

### 3. Testing Checklist
- [ ] Edit all three fields, save successfully
- [ ] Edit only one field, verify save
- [ ] Save with no changes, see "No changes detected"
- [ ] Export edited report, verify DOCX contains edits
- [ ] Test validation errors (empty fields, max length)
- [ ] Test expired report (404 error)
- [ ] Test rate limiting

## API Error Handling
```typescript
switch (response.status) {
  case 404:
    // Report expired - show regenerate option
    showRegenerateDialog();
    break;
  case 403:
    // Unauthorized - re-authenticate
    redirectToLogin();
    break;
  case 422:
    // Validation error - highlight fields
    showValidationErrors();
    break;
  case 429:
    // Rate limit - show retry countdown
    showRateLimitMessage();
    break;
  default:
    showGenericError();
}
```

## Notes
- Edits persist for 24 hours in Redis
- No quota consumption (free for all tiers)
- Title and technique are read-only
- Optional: Use GET /v1/reports/{job_id}/edited to load previous edits
```

---

## 📱 iOS App Integration Prompt

```markdown
# iOS App: Implement Report Editing Feature

## Overview
Add ability for users to edit findings, impression, and recommendations of generated radiology reports before exporting to DOCX.

## Backend API Endpoints
- **PATCH /v1/reports/{job_id}** - Save edited report (JWT auth required)
- **POST /v1/export/docx/link** - Export report (existing, no changes)

## Implementation Steps

### 1. Create Data Models

```swift
// Models/ReportEdit.swift

import Foundation

struct EditReportRequest: Codable {
    let findings: String
    let impression: String
    let recommendations: String?
}

struct EditReportResponse: Codable {
    let success: Bool
    let jobId: String
    let editedFields: [String]
    let editedAt: String
    let message: String

    enum CodingKeys: String, CodingKey {
        case success
        case jobId = "job_id"
        case editedFields = "edited_fields"
        case editedAt = "edited_at"
        case message
    }
}

enum ReportEditError: LocalizedError {
    case reportExpired
    case unauthorized
    case validationFailed
    case networkError
    case serverError

    var errorDescription: String? {
        switch self {
        case .reportExpired:
            return "Report expired. Please regenerate the report."
        case .unauthorized:
            return "You don't have permission to edit this report."
        case .validationFailed:
            return "Please check that all fields are filled correctly."
        case .networkError:
            return "Network error. Please check your connection."
        case .serverError:
            return "Failed to save edits. Please try again."
        }
    }
}
```

### 2. Create API Service

```swift
// Services/ReportEditService.swift

import Foundation

class ReportEditService {
    private let baseURL = "https://api.radly.app"
    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    func saveEdit(
        jobId: String,
        findings: String,
        impression: String,
        recommendations: String?,
        jwt: String
    ) async throws -> EditReportResponse {
        guard let url = URL(string: "\(baseURL)/v1/reports/\(jobId)") else {
            throw ReportEditError.serverError
        }

        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("Bearer \(jwt)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = EditReportRequest(
            findings: findings,
            impression: impression,
            recommendations: recommendations
        )
        request.httpBody = try JSONEncoder().encode(body)

        do {
            let (data, response) = try await session.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw ReportEditError.serverError
            }

            switch httpResponse.statusCode {
            case 200:
                return try JSONDecoder().decode(EditReportResponse.self, from: data)
            case 404:
                throw ReportEditError.reportExpired
            case 403:
                throw ReportEditError.unauthorized
            case 422:
                throw ReportEditError.validationFailed
            default:
                throw ReportEditError.serverError
            }
        } catch is URLError {
            throw ReportEditError.networkError
        } catch let error as ReportEditError {
            throw error
        } catch {
            throw ReportEditError.serverError
        }
    }
}
```

### 3. Create SwiftUI View

```swift
// Views/ReportEditView.swift

import SwiftUI

struct ReportEditView: View {
    let originalReport: Report
    let jobId: String

    @State private var findings: String
    @State private var impression: String
    @State private var recommendations: String
    @State private var isSaving = false
    @State private var saveError: ReportEditError?
    @State private var showSuccessToast = false

    @EnvironmentObject var authService: AuthService
    @Environment(\.dismiss) var dismiss

    private let editService = ReportEditService()
    private let maxFindingsLength = 50_000
    private let maxImpressionLength = 50_000
    private let maxRecommendationsLength = 10_000

    init(report: Report, jobId: String) {
        self.originalReport = report
        self.jobId = jobId
        _findings = State(initialValue: report.findings)
        _impression = State(initialValue: report.impression)
        _recommendations = State(initialValue: report.recommendations ?? "")
    }

    var hasChanges: Bool {
        findings != originalReport.findings ||
        impression != originalReport.impression ||
        recommendations != (originalReport.recommendations ?? "")
    }

    var body: some View {
        NavigationView {
            Form {
                Section(header: HStack {
                    Text("Findings")
                    Spacer()
                    Text("\(findings.count)/\(maxFindingsLength)")
                        .font(.caption)
                        .foregroundColor(findings.count > maxFindingsLength ? .red : .secondary)
                }) {
                    TextEditor(text: $findings)
                        .frame(minHeight: 150)
                        .disabled(isSaving)
                }

                Section(header: HStack {
                    Text("Impression")
                    Spacer()
                    Text("\(impression.count)/\(maxImpressionLength)")
                        .font(.caption)
                        .foregroundColor(impression.count > maxImpressionLength ? .red : .secondary)
                }) {
                    TextEditor(text: $impression)
                        .frame(minHeight: 100)
                        .disabled(isSaving)
                }

                Section(header: HStack {
                    Text("Recommendations (Optional)")
                    Spacer()
                    Text("\(recommendations.count)/\(maxRecommendationsLength)")
                        .font(.caption)
                        .foregroundColor(recommendations.count > maxRecommendationsLength ? .red : .secondary)
                }) {
                    TextEditor(text: $recommendations)
                        .frame(minHeight: 80)
                        .disabled(isSaving)
                }
            }
            .navigationTitle("Edit Report")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .disabled(isSaving)
                }

                ToolbarItem(placement: .primaryAction) {
                    Button(action: saveChanges) {
                        if isSaving {
                            ProgressView()
                        } else {
                            Text("Save")
                        }
                    }
                    .disabled(isSaving || !hasChanges || !isValid)
                }
            }
            .alert(item: $saveError) { error in
                Alert(
                    title: Text("Save Failed"),
                    message: Text(error.errorDescription ?? "Unknown error"),
                    dismissButton: .default(Text("OK"))
                )
            }
            .overlay(
                Group {
                    if showSuccessToast {
                        VStack {
                            Spacer()
                            HStack {
                                Image(systemName: "checkmark.circle.fill")
                                Text("Changes saved")
                            }
                            .padding()
                            .background(Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                            .padding()
                        }
                        .transition(.move(edge: .bottom))
                    }
                }
            )
        }
    }

    var isValid: Bool {
        !findings.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !impression.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        findings.count <= maxFindingsLength &&
        impression.count <= maxImpressionLength &&
        recommendations.count <= maxRecommendationsLength
    }

    func saveChanges() {
        guard let jwt = authService.currentJWT else {
            saveError = .unauthorized
            return
        }

        isSaving = true
        saveError = nil

        Task {
            do {
                let response = try await editService.saveEdit(
                    jobId: jobId,
                    findings: findings,
                    impression: impression,
                    recommendations: recommendations.isEmpty ? nil : recommendations,
                    jwt: jwt
                )

                await MainActor.run {
                    isSaving = false
                    showSuccessToast = true

                    // Hide toast after 2 seconds
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        showSuccessToast = false
                    }
                }
            } catch let error as ReportEditError {
                await MainActor.run {
                    isSaving = false
                    saveError = error
                }
            } catch {
                await MainActor.run {
                    isSaving = false
                    saveError = .serverError
                }
            }
        }
    }
}
```

### 4. Update Report Detail View

Add edit button to your existing report display:

```swift
struct ReportDetailView: View {
    let report: Report
    let jobId: String

    @State private var showEditSheet = false

    var body: some View {
        ScrollView {
            ReportDisplayView(report: report)
        }
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button("Edit") {
                    showEditSheet = true
                }
            }
        }
        .sheet(isPresented: $showEditSheet) {
            ReportEditView(report: report, jobId: jobId)
        }
    }
}
```

### 5. Testing Checklist
- [ ] Edit all three fields and save
- [ ] Verify character count limits
- [ ] Test empty field validation
- [ ] Test save with no changes
- [ ] Export edited report to DOCX
- [ ] Test error handling (expired, unauthorized)
- [ ] Test network error recovery

## Notes
- Use TextEditor for multiline input
- Show character counts to guide users
- Disable save button when no changes or invalid
- Title and technique are read-only (preserved from original)
- Edits persist for 24 hours
```

---

## 🤖 Android App Integration Prompt

```markdown
# Android App: Implement Report Editing Feature

## Overview
Add ability for users to edit findings, impression, and recommendations of generated radiology reports before exporting to DOCX using Jetpack Compose.

## Backend API Endpoints
- **PATCH /v1/reports/{job_id}** - Save edited report (JWT auth required)
- **POST /v1/export/docx/link** - Export report (existing, no changes)

## Implementation Steps

### 1. Create Data Models

```kotlin
// data/models/ReportEdit.kt

package com.radly.app.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class EditReportRequest(
    val findings: String,
    val impression: String,
    val recommendations: String?
)

@Serializable
data class EditReportResponse(
    val success: Boolean,
    @SerialName("job_id") val jobId: String,
    @SerialName("edited_fields") val editedFields: List<String>,
    @SerialName("edited_at") val editedAt: String,
    val message: String
)

sealed class ReportEditError : Exception() {
    object ReportExpired : ReportEditError()
    object Unauthorized : ReportEditError()
    object ValidationFailed : ReportEditError()
    object NetworkError : ReportEditError()
    object ServerError : ReportEditError()

    fun getMessage(): String = when (this) {
        is ReportExpired -> "Report expired. Please regenerate the report."
        is Unauthorized -> "You don't have permission to edit this report."
        is ValidationFailed -> "Please check that all fields are filled correctly."
        is NetworkError -> "Network error. Please check your connection."
        is ServerError -> "Failed to save edits. Please try again."
    }
}
```

### 2. Create API Service

```kotlin
// data/api/ReportEditService.kt

package com.radly.app.data.api

import com.radly.app.data.models.*
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*
import javax.inject.Inject

class ReportEditService @Inject constructor(
    private val client: HttpClient
) {
    private val baseUrl = "https://api.radly.app"

    suspend fun saveEdit(
        jobId: String,
        findings: String,
        impression: String,
        recommendations: String?,
        jwt: String
    ): Result<EditReportResponse> = try {
        val response = client.patch("$baseUrl/v1/reports/$jobId") {
            header("Authorization", "Bearer $jwt")
            contentType(ContentType.Application.Json)
            setBody(EditReportRequest(findings, impression, recommendations))
        }

        when (response.status.value) {
            200 -> Result.success(response.body())
            404 -> Result.failure(ReportEditError.ReportExpired)
            403 -> Result.failure(ReportEditError.Unauthorized)
            422 -> Result.failure(ReportEditError.ValidationFailed)
            else -> Result.failure(ReportEditError.ServerError)
        }
    } catch (e: io.ktor.client.network.sockets.ConnectTimeoutException) {
        Result.failure(ReportEditError.NetworkError)
    } catch (e: Exception) {
        Result.failure(ReportEditError.ServerError)
    }
}
```

### 3. Create ViewModel

```kotlin
// ui/screens/ReportEditViewModel.kt

package com.radly.app.ui.screens

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.radly.app.data.api.ReportEditService
import com.radly.app.data.models.Report
import com.radly.app.data.models.ReportEditError
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ReportEditViewModel @Inject constructor(
    private val editService: ReportEditService
) : ViewModel() {

    var findings by mutableStateOf("")
        private set

    var impression by mutableStateOf("")
        private set

    var recommendations by mutableStateOf("")
        private set

    var isSaving by mutableStateOf(false)
        private set

    var saveError by mutableStateOf<ReportEditError?>(null)
        private set

    var showSuccessToast by mutableStateOf(false)
        private set

    private lateinit var originalReport: Report
    private lateinit var jobId: String
    private lateinit var jwt: String

    companion object {
        const val MAX_FINDINGS_LENGTH = 50_000
        const val MAX_IMPRESSION_LENGTH = 50_000
        const val MAX_RECOMMENDATIONS_LENGTH = 10_000
    }

    fun initialize(report: Report, jobId: String, jwt: String) {
        this.originalReport = report
        this.jobId = jobId
        this.jwt = jwt
        this.findings = report.findings
        this.impression = report.impression
        this.recommendations = report.recommendations ?: ""
    }

    fun updateFindings(value: String) {
        if (value.length <= MAX_FINDINGS_LENGTH) {
            findings = value
        }
    }

    fun updateImpression(value: String) {
        if (value.length <= MAX_IMPRESSION_LENGTH) {
            impression = value
        }
    }

    fun updateRecommendations(value: String) {
        if (value.length <= MAX_RECOMMENDATIONS_LENGTH) {
            recommendations = value
        }
    }

    val hasChanges: Boolean
        get() = findings != originalReport.findings ||
                impression != originalReport.impression ||
                recommendations != (originalReport.recommendations ?: "")

    val isValid: Boolean
        get() = findings.trim().isNotEmpty() &&
                impression.trim().isNotEmpty() &&
                findings.length <= MAX_FINDINGS_LENGTH &&
                impression.length <= MAX_IMPRESSION_LENGTH &&
                recommendations.length <= MAX_RECOMMENDATIONS_LENGTH

    fun saveChanges() {
        if (!isValid) return

        isSaving = true
        saveError = null

        viewModelScope.launch {
            editService.saveEdit(
                jobId = jobId,
                findings = findings,
                impression = impression,
                recommendations = recommendations.takeIf { it.isNotEmpty() },
                jwt = jwt
            ).onSuccess {
                isSaving = false
                showSuccessToast = true
                delay(2000)
                showSuccessToast = false
            }.onFailure { error ->
                isSaving = false
                saveError = error as? ReportEditError ?: ReportEditError.ServerError
            }
        }
    }

    fun dismissError() {
        saveError = null
    }
}
```

### 4. Create Composable UI

```kotlin
// ui/screens/ReportEditScreen.kt

package com.radly.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportEditScreen(
    viewModel: ReportEditViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit,
    onExport: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Edit Report") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                },
                actions = {
                    TextButton(
                        onClick = { viewModel.saveChanges() },
                        enabled = !viewModel.isSaving && viewModel.hasChanges && viewModel.isValid
                    ) {
                        if (viewModel.isSaving) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text("SAVE")
                        }
                    }
                    IconButton(
                        onClick = onExport,
                        enabled = !viewModel.isSaving
                    ) {
                        Icon(Icons.Default.Download, "Export")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Findings
            OutlinedTextField(
                value = viewModel.findings,
                onValueChange = { viewModel.updateFindings(it) },
                label = { Text("Findings") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp),
                maxLines = 10,
                enabled = !viewModel.isSaving,
                supportingText = {
                    Text(
                        "${viewModel.findings.length}/${ReportEditViewModel.MAX_FINDINGS_LENGTH}",
                        color = if (viewModel.findings.length > ReportEditViewModel.MAX_FINDINGS_LENGTH)
                            MaterialTheme.colorScheme.error
                        else
                            MaterialTheme.colorScheme.onSurfaceVariant
                    )
                },
                isError = viewModel.findings.trim().isEmpty()
            )

            // Impression
            OutlinedTextField(
                value = viewModel.impression,
                onValueChange = { viewModel.updateImpression(it) },
                label = { Text("Impression") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(150.dp),
                maxLines = 8,
                enabled = !viewModel.isSaving,
                supportingText = {
                    Text(
                        "${viewModel.impression.length}/${ReportEditViewModel.MAX_IMPRESSION_LENGTH}",
                        color = if (viewModel.impression.length > ReportEditViewModel.MAX_IMPRESSION_LENGTH)
                            MaterialTheme.colorScheme.error
                        else
                            MaterialTheme.colorScheme.onSurfaceVariant
                    )
                },
                isError = viewModel.impression.trim().isEmpty()
            )

            // Recommendations
            OutlinedTextField(
                value = viewModel.recommendations,
                onValueChange = { viewModel.updateRecommendations(it) },
                label = { Text("Recommendations (optional)") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp),
                maxLines = 6,
                enabled = !viewModel.isSaving,
                supportingText = {
                    Text(
                        "${viewModel.recommendations.length}/${ReportEditViewModel.MAX_RECOMMENDATIONS_LENGTH}",
                        color = if (viewModel.recommendations.length > ReportEditViewModel.MAX_RECOMMENDATIONS_LENGTH)
                            MaterialTheme.colorScheme.error
                        else
                            MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            )
        }

        // Success Toast
        if (viewModel.showSuccessToast) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(bottom = 32.dp),
                contentAlignment = Alignment.BottomCenter
            ) {
                Surface(
                    color = MaterialTheme.colorScheme.primary,
                    shape = MaterialTheme.shapes.small
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onPrimary
                        )
                        Text(
                            "Changes saved",
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    }
                }
            }
        }

        // Error Dialog
        viewModel.saveError?.let { error ->
            AlertDialog(
                onDismissRequest = { viewModel.dismissError() },
                title = { Text("Save Failed") },
                text = { Text(error.getMessage()) },
                confirmButton = {
                    TextButton(onClick = { viewModel.dismissError() }) {
                        Text("OK")
                    }
                }
            )
        }
    }
}
```

### 5. Navigation Setup

Add to your navigation graph:

```kotlin
composable(
    route = "report_edit/{jobId}",
    arguments = listOf(navArgument("jobId") { type = NavType.StringType })
) { backStackEntry ->
    val jobId = backStackEntry.arguments?.getString("jobId") ?: return@composable
    val report = // Get report from state/arguments
    val jwt = authViewModel.currentJWT ?: return@composable

    val viewModel: ReportEditViewModel = hiltViewModel()
    LaunchedEffect(Unit) {
        viewModel.initialize(report, jobId, jwt)
    }

    ReportEditScreen(
        viewModel = viewModel,
        onNavigateBack = { navController.popBackStack() },
        onExport = {
            // Navigate to export flow with edited report
            exportViewModel.exportReport(
                report.copy(
                    findings = viewModel.findings,
                    impression = viewModel.impression,
                    recommendations = viewModel.recommendations.takeIf { it.isNotEmpty() }
                ),
                jobId
            )
        }
    )
}
```

### 6. Testing Checklist
- [ ] Edit all three fields and save
- [ ] Verify character count limits enforced
- [ ] Test empty field validation
- [ ] Test save with no changes
- [ ] Export edited report to DOCX
- [ ] Test error handling (expired, unauthorized, network)
- [ ] Test configuration changes (rotation)

## Dependencies

Add to `build.gradle.kts`:
```kotlin
dependencies {
    // Ktor for networking
    implementation("io.ktor:ktor-client-android:2.3.0")
    implementation("io.ktor:ktor-client-serialization:2.3.0")
    implementation("io.ktor:ktor-client-content-negotiation:2.3.0")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.0")

    // Kotlinx Serialization
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")

    // Hilt for DI
    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-compiler:2.48")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
}
```

## Notes
- Use Ktor for networking (or Retrofit if already in project)
- Edits persist for 24 hours
- Title and technique are read-only (preserved from original)
- Character count updates in real-time
```

---

## 🔒 Security & Compliance

- **Authorization:** JWT-based, only report owner can edit
- **Audit Trail:**
  - `job_history.edited_at` and `edited_by` columns
  - `report_versions` table with complete edit history
  - `audit_log` table for security monitoring
- **Data Integrity:**
  - Read-only: title, technique, patient IDs (HIPAA)
  - Preserved: LLM metadata (AI provenance)
- **Rate Limiting:** 30 edits/minute per user

---

## ⏱️ Data Retention

- **Redis (edited reports):** 24-hour TTL
- **PostgreSQL (edit history):** Permanent
- **Audit logs:** 90 days (configurable)

After 24 hours, user must regenerate report to edit again.

---

## 📊 Testing Summary

```bash
✅ All 11 tests passing (100%)

Test Coverage:
• Edit report successfully (all fields)
• Edit report with no changes
• Edit report not found (404)
• Edit unauthorized report (403)
• Edit expired report (404)
• Validation: empty fields (422)
• Edit partial fields
• GET edited report success
• GET edited report not found
• GET edit status (edited)
• GET edit status (not edited)
```

---

## 🆘 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 404 "Report expired" | Report data TTL expired (24h) | Regenerate the report |
| 403 Unauthorized | Invalid JWT or wrong user | Re-authenticate |
| 422 Validation failed | Empty fields or max length | Check field requirements |
| 429 Rate limit | >30 saves/minute | Wait before retrying |

---

## 📞 Support

- **Backend Status:** Check `/health` endpoint
- **Database:** Migration applied ✅
- **Tests:** 11/11 passing ✅
- **Documentation:** See `/home/app/radly/CLAUDE.md`
