import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Log, LoggingService } from '../../services/logging.service';
import { UserService } from '../../services/user.service';
import { PlanteService } from '../../services/plante.service';

@Component({
  selector: 'app-detail-actions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detail-actions.component.html',
  styleUrls: ['./detail-actions.component.css'],
})
export class DetailActionsComponent implements OnInit {
  log: Log | null = null;
  filteredActions: Log['actions'] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  actionTypeFilter: string = '';
  searchTerm: string = '';
  dateFilter: string = '';
  isModalOpenUser: boolean = false;
  isModalOpenPlant: boolean = false;
  selectedEntity: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private loggingService: LoggingService,
    private planteService: PlanteService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const date = params.get('date');
      if (date) {
        this.selectActionsByUserIdAndEntityIdAndDate(date);
      }
    });
  }

  selectUserById(userId: string) {
    this.userService.getUser(userId).subscribe(user => {
      this.selectedEntity = user;
    });
  }

  selectPlanteById(plantId: string) {
    this.planteService.getPlanteById(plantId).subscribe(plant => {
      this.selectedEntity = plant;
    });
  }

  selectActionsByUserIdAndEntityIdAndDate(date: string) {
    this.loggingService.getLogsByDate(date).subscribe(actions => {
      this.log = actions;
      this.filteredActions = [...actions.actions];
      this.filterActions();
    });
  }

  filterActions() {
    const term = this.searchTerm.toLowerCase();
    const date = this.dateFilter;

    this.filteredActions = this.log?.actions.filter(action => {
      const matchesType = !this.actionTypeFilter || action.type.toLowerCase().includes(this.actionTypeFilter.toLowerCase());
      const matchesTerm = !term || action.entity.toLowerCase().includes(term);
      const matchesDate = !date || new Date(action.timestamp).toISOString().split('T')[0] === date;

      return matchesType && matchesTerm && matchesDate;
    }) || [];
  }

  get paginatedActions() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredActions.slice(start, end);
  }

  get totalPages() {
    return Math.ceil(this.filteredActions.length / this.itemsPerPage);
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  navigateBack() {
    this.router.navigate(['/historique']);
  }

  navigateToActionDetails(entity: string, entityId: string) {
    if (entity === 'plante') {
      this.selectPlanteById(entityId);
      this.openModalPlant();
    } else if (entity === 'user') {
      this.selectUserById(entityId);
      this.openModalUser();
    }
  }

  openModalUser() {
    this.isModalOpenUser = true;
  }

  closeModalUser() {
    this.isModalOpenUser = false;
  }

  openModalPlant() {
    this.isModalOpenPlant = true;
  }

  closeModalPlant() {
    this.isModalOpenPlant = false;
  }
}
