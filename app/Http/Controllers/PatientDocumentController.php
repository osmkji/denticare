<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\PatientDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class PatientDocumentController extends Controller
{
    /**
     * Enregistre un document clinique (radio, photo, compte-rendu) pour le patient.
     */
    public function store(Request $request, Patient $patient): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:xray,photo,other',
            'file' => 'required|file|max:20480|mimes:jpg,jpeg,png,webp,pdf',
        ]);

        $file = $request->file('file');
        $path = $file->store("patients/{$patient->id}/documents", 'public');

        $document = PatientDocument::create([
            'cabinet_id' => $request->user()->cabinet_id,
            'patient_id' => $patient->id,
            'title' => $validated['title'],
            'type' => $validated['type'],
            'file_path' => $path,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'document' => $document,
                'message' => 'Document téléversé avec succès.',
            ], 201);
        }

        return back()->with('success', "Document « {$document->title} » ajouté au dossier du patient.");
    }

    /**
     * Supprime un document du dossier patient et efface le fichier physique.
     */
    public function destroy(PatientDocument $document): RedirectResponse|JsonResponse
    {
        Gate::authorize('delete', $document);

        if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $title = $document->title;
        $document->delete();

        if (request()->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', "Document « {$title} » supprimé.");
    }
}

