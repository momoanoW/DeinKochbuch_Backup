import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { MyrecipesComponent} from './myrecipes/myrecipes.component';
import { NewrecipeComponent} from './newrecipe/newrecipe.component';
import { RegisterComponent} from './register/register.component';


export const routes: Routes = [
  { path: "myrecipes", component: MyrecipesComponent},
  { path: "login", component: LoginComponent },
  { path: "home", component: HomeComponent },
  { path: "newrecipes", component: NewrecipeComponent},
  { path: "register", component: RegisterComponent},
];

