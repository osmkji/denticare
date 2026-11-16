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
        Schema::create('clinical_acts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cabinet_id')->constrained('cabinets')->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('dentist_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('code')->nullable(); // Code CCAM (e.g. HBGD036)
            $table->string('description');
            $table->string('tooth_number')->nullable(); // e.g. 16, 21, 36...
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['planned', 'in_progress', 'validated'])->default('validated');
            $table->dateTime('performed_at');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['cabinet_id', 'performed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clinical_acts');
    }
};

