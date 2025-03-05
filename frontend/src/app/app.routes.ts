import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { MyrecipesComponent} from './myrecipes/myrecipes.component';
import { NewrecipeComponent} from './newrecipe/newrecipe.component';
import { RegisterComponent} from './register/register.component';


export const routes: Routes = [
  { path: "myrecipes", title: "My Recipes", component: MyrecipesComponent},
  { path: "login", title: "Login", component: LoginComponent },
  { path: "", title: "Home", component: HomeComponent, pathMatch: 'full' },
  { path: "newrecipe", title: "Recipe", component: NewrecipeComponent},
  { path: "register", title: "Register", component: RegisterComponent},
  { path: "**", redirectTo: "home" },
];

