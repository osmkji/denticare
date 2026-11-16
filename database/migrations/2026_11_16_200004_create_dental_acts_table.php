<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dental_acts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cabinet_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('dentist_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('tooth_number', 5)->nullable();
            $table->enum('act_type', [
                'healthy',
                'caries',
                'composite',
                'endo',
                'extraction',
                'crown',
                'implant',
                'absent',
                'scaling',
            ])->default('healthy');
            $table->string('description');
            $table->text('clinical_notes')->nullable();
            $table->decimal('price', 10, 2)->default(0.00);
            $table->enum('status', ['planned', 'completed'])->default('planned');
            $table->date('performed_at')->nullable();
            $table->timestamps();

            $table->index(['cabinet_id', 'patient_id']);
            $table->index(['patient_id', 'tooth_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dental_acts');
    }
};

