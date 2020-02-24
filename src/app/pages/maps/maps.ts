import { TICKET_COST, ATS_PERCENTAGE, ATS_FEE } from './../../config/yonkers-settings';
import { DataTableService } from './components/data-table/data-table.service';
import { FilterParamsService } from './../../services/data/filter-params.service';
import { mapStylesDark } from './../../config/map-config';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/security/auth.service';
import { DataService } from '../../services/data/data.service';
import pageSettings from '../../config/page-settings';
import { YONKERS_BOUNDARY } from './boundary';
import { MapsService } from './maps.service';

declare var google;

@Component({
  selector: 'maps',
  templateUrl: './maps.html',
  styleUrls: ['./maps.scss']
})

export class MapsPage implements OnInit, OnDestroy {

  public pageSettings = pageSettings;
  public markers = [  {lat: 40.954628, lng: -73.8640664} ];
  public cameraData: any;
  public isAuthenticated: boolean;
  public mapStyles = mapStylesDark;

  public mapInstance: any;


  public ticketCost = TICKET_COST;
  public isDialogVisible = false;
  public dialogTitle: string;
  public selectedCamera: any;
  public selectedBarType: any;
  public idList: any[];

  public comparissonTable;
  public viewDetailsData;

  public mapDashboard = {
    totalRevenue: 0,
    totalTicketsIssued: 0,
    totalTicketsPaid: 0,
    totalATSFees: 0,
    camerasCount: 0
  };
  public isViewDetailsDialogVisible: boolean;
  public viewDetailsTitle: string = 'title';
  public listItems: Array<string> = [];
  public panelDimensions = { height: 700, width: 780 };
  public titleBarClass = 'box2';

  // Map Options
  public isTrafficOverlay = false;
  public isBoundaryOverlay = false;
  public yonkersBoundaryLayer: any;
  public trafficLayer: any;
  public toggle = false;
  public isMarkersVisible: boolean = true;

  public heatmapRevenue: any;
  public isHeatmapRevenueOverlay: boolean = false;

  public heatmapPaid: any;
  public isheatmapPaidOverlay: boolean = false;

  public isTotalRevenueViewDetails: boolean = false;

  ngOnInit() {

  }

  ngOnDestroy() {
    this.pageSettings.pageContentFullWidth = false;
    this.pageSettings.pageContentInverseMode = false;
  }

  constructor (
    public auth: AuthService,
    public _dataService: DataService,
    public _dataTable: DataTableService,
    public _paramsService: FilterParamsService,
    public _mapsService: MapsService) {

    this.pageSettings.pageContentFullWidth = true;
    this.pageSettings.pageContentInverseMode = true;

    this.auth.isAuthenticated$.subscribe(isAuthenticated => { this.isAuthenticated = isAuthenticated; });

    this._paramsService.getAllSiteId().subscribe(res => {

      // gets all the available site ID's
      this.idList = res.map(ele => { return ele.site_id; });
        this._paramsService.getAllDistinctStreets('street_one').subscribe(res => {
        const streetOne = res.map(ele => { return ele.street_one; });

        this._paramsService.getAllDistinctStreets('street_two').subscribe(res => {
          const streetTwo = res.map(ele => { return ele.street_two; });
          const common = streetOne.filter(value => -1 !== streetTwo.indexOf(value));
          const filteredStreetOne = streetOne.filter(function(x) { return common.indexOf(x) < 0; });
          const filteredStreetTwo = streetTwo.filter(function(x) { return common.indexOf(x) < 0; });
          const combined = filteredStreetOne.concat(filteredStreetTwo).concat(common);
          this.listItems = combined;

            this._dataService.getAllTrafficCams(this.listItems).subscribe(res => {
              this.processDataForMapsDashboard(res);
            });
        });

        this._dataService.getViewDetailsRevenue(this.idList).subscribe(res => {
          this.viewDetailsData = {
            kendoData: {
              series: [{
                name: "Total Earnings",
                data: res.map(ele => {return ele.total_earnings })
              }],
              categories: ['Jan','Feb', 'Mar', 'Apr', 'May', 'Jun','Jul','Aug','Sept','Oct','Nov','Dec']
            }
          }
        });


      });

    }); // End Get All SiteID's

    this._dataTable.selectedMarkers.subscribe(res => {
      this._dataService.getViewDetailsRevenue(res).subscribe(res => {

        this.viewDetailsData = {
          totalRevenue: res.map(ele => {
            return ele.total_earnings
          }).reduce(function(a, b) { return a + b; }, 0),
          kendoData: {
            series: [{
              name: "Total Earnings",
              data: res.map(ele => { return ele.total_earnings })
            }],
            categories:  ['Jan','Feb', 'Mar', 'Apr', 'May', 'Jun','Jul','Aug','Sept','Oct','Nov','Dec']
          }
        }
      });
    })

    this.panelDimensions.height = window.innerHeight;
    this.panelDimensions.width = window.innerWidth;
  }



  processDataForMapsDashboard(data: any[]): void {
    this.cameraData = data;

    this.idList = data.map(ele => {
      return ele.site_id;
    })

    // console.log(this.idList);

    this._mapsService.cameraData.next(data);
    const totalRevenue = data.map(ele => { return ele.total_earnings; }).reduce(function(a, b) { return a + b; }, 0);
    const totalTicketsPaid = data.map(ele => { return ele.paid; }).reduce(function(a, b) { return a + b; }, 0);
    const totalTicketsIssued = data.map(ele => { return ele.issued; }).reduce(function(a, b) { return a + b; }, 0);
    const atsFees = totalRevenue * ATS_PERCENTAGE - ATS_FEE;
    this.mapDashboard = {
      totalRevenue: totalRevenue,
      totalTicketsIssued: totalTicketsIssued,
      totalTicketsPaid: totalTicketsPaid,
      totalATSFees: atsFees,
      camerasCount: data.length
    };

    this._mapsService.comparissonTable.next(data);
    this.comparissonTable = data;

  }

  valueChange(value: any[]) {

    if (value.length > 0 ) {
      this._dataService.getAllTrafficCams(value).subscribe(res => {
        this.processDataForMapsDashboard(res);
      });
    } else {
      this._dataService.getAllTrafficCams(this.listItems).subscribe(res => {
        this.processDataForMapsDashboard(res);
      });
    }
  }


  onMapReady(mapInstance: any): void {

    // console.log(mapInstance);
    this.mapInstance = mapInstance;

    // Initialize traffic layer
    this.trafficLayer = new google.maps.TrafficLayer();

    // Initialize polygon layer
    let yonkersCoords = YONKERS_BOUNDARY.map(ele => { return {lat: ele[1], lng: ele[0]}; });
    this.yonkersBoundaryLayer = new google.maps.Polygon({
      paths: yonkersCoords,
      strokeColor: '#e74d3c',
      strokeOpacity: 0.8,
      strokeWeight: 1.2,
      fillColor: '#e74d3c',
      fillOpacity: 0.20
    });

    this._mapsService.cameraData.subscribe(res => {
      this.cameraData = res;
      // heatmap revenue
      this.heatmapRevenue = new google.maps.visualization.HeatmapLayer({
        data: this.cameraData.map(ele => {
          return {location: new google.maps.LatLng(ele.lat, ele.lng), weight: ele.paid}
        })
      });

      // heatmap ats fee
      this.heatmapPaid = new google.maps.visualization.HeatmapLayer({
        data: this.cameraData.map(ele => {
          return {location: new google.maps.LatLng(ele.lat, ele.lng), weight: ele.issued}
        })
      });

      this.heatmapRevenue.set('radius', this.heatmapRevenue.get('radius') ? null : 60);
      this.heatmapPaid.set('radius', this.heatmapPaid.get('radius') ? null : 45);
      let gradient = ['rgba(0, 255, 255, 0)','rgba(0, 255, 255, 1)','rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)','rgba(0, 63, 255, 1)','rgba(0, 0, 255, 1)', 'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)', 'rgba(0, 0, 159, 1)', 'rgba(0, 0, 127, 1)', 'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)','rgba(191, 0, 31, 1)','rgba(255, 0, 0, 1)'
      ];

      this.heatmapPaid.set('gradient', this.heatmapPaid.get('gradient') ? null : gradient);
    })

    // // heatmap revenue
    // this.heatmapRevenue = new google.maps.visualization.HeatmapLayer({
    //   data: this.cameraData.map(ele => {
    //     return {location: new google.maps.LatLng(ele.lat, ele.lng), weight: ele.paid}
    //   })
    // });

    // // heatmap ats fee
    // this.heatmapPaid = new google.maps.visualization.HeatmapLayer({
    //   data: this.cameraData.map(ele => {
    //     return {location: new google.maps.LatLng(ele.lat, ele.lng), weight: ele.issued}
    //   })
    // });

    // this.heatmapRevenue.set('radius', this.heatmapRevenue.get('radius') ? null : 60);
    // this.heatmapPaid.set('radius', this.heatmapPaid.get('radius') ? null : 45);
    // let gradient = ['rgba(0, 255, 255, 0)','rgba(0, 255, 255, 1)','rgba(0, 191, 255, 1)',
    //   'rgba(0, 127, 255, 1)','rgba(0, 63, 255, 1)','rgba(0, 0, 255, 1)', 'rgba(0, 0, 223, 1)',
    //   'rgba(0, 0, 191, 1)', 'rgba(0, 0, 159, 1)', 'rgba(0, 0, 127, 1)', 'rgba(63, 0, 91, 1)',
    //   'rgba(127, 0, 63, 1)','rgba(191, 0, 31, 1)','rgba(255, 0, 0, 1)'
    // ];

    // this.heatmapPaid.set('gradient', this.heatmapPaid.get('gradient') ? null : gradient);

  }

  onMarkerClick(index: any) {
    const camera = this.cameraData[index];
    const site_id = camera.site_id;
    this.selectedCamera = camera;

    this._dataService.getPaymentsForCam(site_id).subscribe(res => {

      // console.log(res);
      // Get all the paid objects
      const paid = res.map(ele => {
        if(ele.type === 'paid') {
          return ele;
        }
      }).filter(notUndefined => notUndefined);

      // Get all the issued objects
      const issued = res.map(ele => {
        if(ele.type === 'issued') {
          return ele;
        }
      }).filter(notUndefined => notUndefined);

      // An array of the paid totals
      const paidYear = paid.map(ele => { return ele.total; });

      const sumOfPaidThisYear = paidYear.reduce((a, b) => a + b, 0);
      const issuedYear = issued.map(ele => { return ele.total; });
      const sumOfIssuedThisYear = issuedYear.reduce((a, b) => a + b, 0);

      // Objects for the kendo chart line
      const p = new Object({name: "Paid", data: paidYear});
      const i = new Object({name: "Issued", data: issuedYear});

      // Packaged series and categories to send to kendo line chart
      const series = [p,i];
      const categories = ['Jan','Feb', 'Mar', 'Apr', 'May', 'Jun','Jul','Aug','Sept','Oct','Nov','Dec'];

      this.dialogTitle = camera.direction_long + ' on ' + camera.street_one + ' & ' + camera.street_two;

      const paidEarningsThisYear = sumOfPaidThisYear * TICKET_COST;
      const atsFee = (paidEarningsThisYear * ATS_PERCENTAGE - ATS_FEE);

      this.selectedCamera = new Object({
        site_id: camera.site_id,
        status: camera.construction,
        camera_status: camera.status,
        location_code: camera.location_code,
        paidTicketsForCurrentYear: sumOfPaidThisYear + ' Tickets',
        issuedTicketsForCurrentYear: sumOfIssuedThisYear + ' Tickets',
        paidEarningsTotalForCurrentYear: paidEarningsThisYear,
        collectionRate:  sumOfPaidThisYear / sumOfIssuedThisYear,
        atsFee: atsFee,
        kendoData: new Object({
          series: series,
          categories: categories
        })
      });
      const idArray = this.cameraData.map(ele => {
        return ele.site_id;
      });

      this._dataService.getComparissonTable(idArray).subscribe(res => {
        this._mapsService.comparissonTable.next(res);
        this.comparissonTable = res;
      });

      this.isDialogVisible = true;
    });
  }

  closeDialog(): void {
    this.isDialogVisible = false;
    this.isViewDetailsDialogVisible = false
  }

  markerIconUrl(marker: any) {
    return this._mapsService.getCustomMarker(marker);
  }

  onOptionsClick() {
    this.toggle = !this.toggle;
  }

  onViewDetailsClick(box: string) {
    this.isViewDetailsDialogVisible = true;
    switch(box) {
      case 'totalRevenue':
        this.viewDetailsTitle = 'Total Revenue';
        this.titleBarClass = 'box1';
          this.isTotalRevenueViewDetails = true;
          this._dataService.getViewDetailsRevenue(this.idList).subscribe(res => {

            this.viewDetailsData = {
              totalRevenue: res.map(ele => {
                return ele.total_earnings
              }).reduce(function(a, b) { return a + b; }, 0),
              kendoData: {
                series: [{
                  name: "Total Earnings",
                  data: res.map(ele => { return ele.total_earnings })
                }],
                categories:  ['Jan','Feb', 'Mar', 'Apr', 'May', 'Jun','Jul','Aug','Sept','Oct','Nov','Dec']
              }
            }
          });
        break;
      case 'ATSFees':
      this.isTotalRevenueViewDetails = false;
        this.viewDetailsTitle = 'ATS Fees'
        this.titleBarClass = 'box2';
        break;
      case 'totalTicketsIssued':
      this.isTotalRevenueViewDetails = false;
        this.viewDetailsTitle = 'Total Tickets Issued'
        this.titleBarClass = 'box3';
        break;
      case 'totalTicketsPaid':
      this.isTotalRevenueViewDetails = false;
        this.viewDetailsTitle = 'Total Tickets Paid'
        this.titleBarClass = 'box4';
        break;
      case 'cameras':
      this.isTotalRevenueViewDetails = false;
        this.viewDetailsTitle = 'Cameras'
        this.titleBarClass = 'box5';
        break;
      default:
        this.viewDetailsTitle = '';
        break;
    }
  }

  onTrafficCamClick(type: string) {
    switch (type) {
      case 'traffic':
          if (!this.isTrafficOverlay) {
            this.isTrafficOverlay = true;
            this.trafficLayer.setMap(this.mapInstance);
          } else {
            this.isTrafficOverlay = false;
            this.trafficLayer.setMap(null);
          }
        break;
      case 'boundary':
          if (!this.isBoundaryOverlay) {
            this.isBoundaryOverlay = true;
            this.yonkersBoundaryLayer.setMap(this.mapInstance);
          } else {
            this.isBoundaryOverlay = false;
            this.yonkersBoundaryLayer.setMap(null);
          }
        break;
      case 'heatmap-revenue':
          if (!this.isHeatmapRevenueOverlay) {
            this.isHeatmapRevenueOverlay = true;
            this.heatmapRevenue.setMap(this.heatmapRevenue.getMap() ? null : this.mapInstance);
          } else {
            this.isHeatmapRevenueOverlay = false;
            this.heatmapRevenue.setMap(this.heatmapRevenue.getMap() ? null : null);
          }
        break;
      case 'heatmap-paid':
          if (!this.isheatmapPaidOverlay) {
            this.isheatmapPaidOverlay = true;
            this.heatmapPaid.setMap(this.heatmapPaid.getMap() ? null : this.mapInstance);
          } else {
            this.isheatmapPaidOverlay = false;
            this.heatmapPaid.setMap(this.heatmapPaid.getMap() ? null : null);
          }
        break;
      case 'markers':
        if (!this.isMarkersVisible) {
          this.isMarkersVisible = true;
        } else {
          this.isMarkersVisible = false;
        }
      break;

    }
  }

}
