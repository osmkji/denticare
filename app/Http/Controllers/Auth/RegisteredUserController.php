<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Cabinet;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'nullable|in:dentist,assistant',
            'cabinet_name' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
        ]);

        $cabinetName = $request->filled('cabinet_name') ? $request->cabinet_name : 'Cabinet ' . $request->name;

        // Création du cabinet pour le nouveau souscripteur (Forfait Free par défaut)
        $cabinet = Cabinet::create([
            'name' => $cabinetName,
            'city' => $request->city ?? 'Paris',
            'phone' => $request->phone,
            'plan' => 'free',
        ]);

        $user = User::create([
            'cabinet_id' => $cabinet->id,
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role ?? 'dentist',
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
