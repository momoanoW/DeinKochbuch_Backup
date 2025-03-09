import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-newrecipe',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './newrecipe.component.html',
  styleUrl: './newrecipe.component.css'
})
export class NewrecipeComponent {

  rezept = {
    name: '',
    anleitung: '',
    anzahlportionen: 0,
    zubereitungszeitmin: 0,
    rohkost: false,
    vegan: false,
    vegetarisch: false,
    glutenfrei: false,
    zutaten: [] as { zutaten_id: number, menge: number }[]
  };

  zutatenVorschlaege: { id: number, name: string }[] = [];
  ausgewaehlteZutaten: { zutat_id: number, name: string, menge: number }[] = [];
  rezeptId: number | null = null; // Wird nach dem Speichern des Rezepts gesetzt und automatisch fortgeführt durch DB Einstellungen

  constructor(private http: HttpClient) {}

  onSubmit() {
    this.http.post<number>('/api/rezepte', this.rezept).subscribe(rezeptId => {
      this.rezeptId = rezeptId;
      this.speichereZutaten();
    });
  }

  // Zutaten-Suche mit Autocomplete
  sucheZutat(event: any) {
    const input = event.target.value;
    if (input.length > 1) {
      this.http.get<{ id: number, name: string }[]>(`/api/zutaten?s=${input}`)
        .subscribe(data => {
          this.zutatenVorschlaege = data;
        });
    } else {
      this.zutatenVorschlaege = [];
    }
  }

  // Zutat mit Menge speichern
  zutatHinzufuegen(zutat: { id: number, name: string }, menge: number) {
    if (menge > 0) {
      this.ausgewaehlteZutaten.push({ zutat_id: zutat.id, name: zutat.name, menge });
      this.zutatenVorschlaege = []; // Dropdown leeren
    }
  }

  // Speichert Zutaten mit Rezept-ID in `Beinhaltet`
  speichereZutaten() {
    if (this.rezeptId) {
      this.ausgewaehlteZutaten.forEach(zutat => {
        const beinhaltetEintrag = {
          rezept_id: this.rezeptId,
          zutat_id: zutat.zutat_id,
          menge: zutat.menge
        };
        this.http.post('/api/beinhaltet', beinhaltetEintrag).subscribe();
      });
    }
  }

}
