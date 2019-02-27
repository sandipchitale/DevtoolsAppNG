import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DevtoolsAppNGComponent } from './components/devtoolsappng/devtools-app-ng.component';

const routes: Routes = [
    {
        path: '',
        component: DevtoolsAppNGComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
