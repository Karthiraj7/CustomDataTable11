import * as React from 'react';
import * as XLSX from 'xlsx';

interface DataTableProps {
  columnHeaders: string[];
  itemsPerPageOptions: number[];
  defaultItemsPerPage: number;
  data: any[];
}

interface DataTableState {
  columnFilters: { [key: string]: string[] };
  globalFilter: string;
  currentPage: number;
  itemsPerPage: number;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  columnAlignments: { [key: string]: 'left' | 'center' | 'right' };
  columnDropdownVisible: { [key: string]: boolean };
  columnSuggestions: { [key: string]: string[] };
  typingValue: { [key: string]: string };
}

class DataTable extends React.Component<DataTableProps, DataTableState> {
  constructor(props: DataTableProps) {
    super(props);

    // Initialize state
    this.state = {
      columnFilters: Object.fromEntries(props.columnHeaders.map(header => [header, []])),
      globalFilter: '',
      currentPage: 1,
      itemsPerPage: props.defaultItemsPerPage,
      sortColumn: '',
      sortDirection: 'asc',
      columnAlignments: Object.fromEntries(props.columnHeaders.map(header => [header, 'left'])),
      columnDropdownVisible: Object.fromEntries(props.columnHeaders.map(header => [header, false])),
      columnSuggestions: Object.fromEntries(props.columnHeaders.map(header => [header, []])),
      typingValue: Object.fromEntries(props.columnHeaders.map(header => [header, ''])),
    };
  }

  // Handle column filter changes
  handleColumnFilter = (header: string, value: string) => {
    this.setState(prevState => ({
      columnFilters: {
        ...prevState.columnFilters,
        [header]: prevState.columnFilters[header].includes(value)
          ? prevState.columnFilters[header].filter(v => v !== value)
          : [...prevState.columnFilters[header], value]
      },
      currentPage: 1,
      typingValue: {
        ...prevState.typingValue,
        [header]: '',
      },
    }));
  };

  // Handle global filter change
  handleGlobalFilter = (value: string) => {
    this.setState({ globalFilter: value.toLowerCase(), currentPage: 1 });
  };

  // Handle page change
  handlePageChange = (page: number) => {
    this.setState({ currentPage: page });
  };

  // Handle items per page change
  handleItemsPerPageChange = (value: number) => {
    this.setState({ itemsPerPage: value === -1 ? Infinity : value, currentPage: 1 });
  };

  // Toggle column dropdown visibility
  toggleColumnDropdown = (header: string) => {
    this.setState(prevState => ({
      columnDropdownVisible: {
        ...prevState.columnDropdownVisible,
        [header]: !prevState.columnDropdownVisible[header]
      }
    }));
  };

  // Handle sorting
  handleSort = (header: string) => {
    const { sortColumn, sortDirection } = this.state;
    let newSortDirection: 'asc' | 'desc' = 'asc';
    if (sortColumn === header) {
      newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    this.setState({
      sortColumn: header,
      sortDirection: newSortDirection,
      currentPage: 1
    });
  };

  // Get sort button text and indicator

  getSortButtonText = (header: string) => {
    const { sortColumn, sortDirection } = this.state;
    
    if (sortColumn === header) {
      return sortDirection === 'asc' ? (
        <img src='https://3c3tsp.sharepoint.com/sites/demosite/siteone/karthiassessment/SiteAssets/DataTable/image/f7_sort-down%202.svg' alt='Ascending' />
      ) : (
        <img src='https://3c3tsp.sharepoint.com/sites/demosite/siteone/karthiassessment/SiteAssets/DataTable/image/f7_sort-down.svg' alt='Descending' />
      );
    }
  
    return <img src='https://3c3tsp.sharepoint.com/sites/demosite/siteone/karthiassessment/SiteAssets/DataTable/image/f7_sort-down.svg' alt='Default' />;
  };

  

// Handle column search
handleColumnSearch = (header: string, searchText: string): void => {
  const { data, columnHeaders } = this.props;
  const headerIndex = columnHeaders.indexOf(header);

  const uniqueSuggestions = new Set<string>();

  data.forEach(row => {
    if (row) {
      const cellValue = `${row[headerIndex] || ''}`.toLowerCase();
      if (cellValue.includes(searchText.toLowerCase())) {
        uniqueSuggestions.add(cellValue);
      }
    }
  });

  const filteredSuggestions = Array.from(uniqueSuggestions);

  // Reset suggestions for the previous column
  const prevHeader = Object.keys(this.state.columnSuggestions).find(
    key => this.state.columnSuggestions[key] && this.state.columnSuggestions[key].length > 0
  );
  if (prevHeader && prevHeader !== header) {
    this.setState(prevState => ({
      columnSuggestions: {
        ...prevState.columnSuggestions,
        [prevHeader]: []
      },
      columnDropdownVisible: {
        ...prevState.columnDropdownVisible,
        [prevHeader]: false
      }
    }));
  }

  this.setState(prevState => ({
    columnSuggestions: {
      ...prevState.columnSuggestions,
      [header]: filteredSuggestions
    },
    typingValue: {
      ...prevState.typingValue,
      [header]: searchText,
    },
    currentPage: 1,
    columnDropdownVisible: {
      ...prevState.columnDropdownVisible,
      [header]: filteredSuggestions.length > 0  // Set visibility based on suggestions
    }
  }));
};





  // Handle suggestion selection
  handleSuggestionSelect = (header: string, value: string) => {
    this.setState(prevState => {
      const newFilters = [...prevState.columnFilters[header]];
      const valueIndex = newFilters.indexOf(value);
      if (valueIndex === -1) {
        newFilters.push(value);
      } else {
        newFilters.splice(valueIndex, 1);
      }
      return {
        columnFilters: {
          ...prevState.columnFilters,
          [header]: newFilters,
        },
        currentPage: 1,
        typingValue: {
          ...prevState.typingValue,
          [header]: '',
        },
      };
    });
  };

  // Get column filter text
  getColumnFilterText = (header: string) => {
    const { columnFilters, typingValue } = this.state;
    const count = columnFilters[header].length;
    return typingValue[header] !== ''
      ? typingValue[header]
      : count === 0
        ? ''
        : `${count} item${count > 1 ? 's' : ''} selected`;
  };

  // Export data to Excel
  exportToExcel = () => {
    const { columnHeaders, data } = this.props;
  
    const worksheetData = [
      columnHeaders,
      ...data.map(row => row.map((cell: any) => (cell != null ? cell : '')))
    ];
  
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'data.xlsx');
  };


  
  render() {
    const { columnHeaders, itemsPerPageOptions, data } = this.props;
    const {
      columnFilters,
      globalFilter,
      currentPage,
      itemsPerPage,
      sortColumn,
      sortDirection,
      columnAlignments,
      columnSuggestions,
      columnDropdownVisible  // Include columnDropdownVisible from state
    } = this.state;
  
    const filteredData = data.filter(row => {
      return row && columnHeaders.every(header => {
        const selectedValues = columnFilters[header];
        if (selectedValues.length === 0) {
          return true;
        }
        const cellValue = `${row[columnHeaders.indexOf(header)] || ''}`.toLowerCase();
        return selectedValues.some(filterValue => cellValue.includes(filterValue.toLowerCase()));
      }) && (
        columnHeaders.some(header => {
          const cellValue = `${row[columnHeaders.indexOf(header)] || ''}`.toLowerCase();
          return cellValue.includes(globalFilter);
        }) || globalFilter === ''
      );
    });
  
    let sortedData = filteredData;
    if (sortColumn) {
      sortedData = sortedData.sort((a, b) => {
        const aValue = `${a[columnHeaders.indexOf(sortColumn)] || ''}`;
        const bValue = `${b[columnHeaders.indexOf(sortColumn)] || ''}`;
        if (aValue < bValue) {
          return sortDirection === 'asc' ? -1 : 1;
        } else if (aValue > bValue) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
  
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  

    return (
      <div>


<div>
<div>
<div className="SupplierComparison">
          {/* <div className="header">
            <header>
              <a><img src="https://3c3tsp.sharepoint.com/sites/demosite/siteone/karthiassessment/SiteAssets/DataTable/image/logo.png" alt="logo" className="logo" /></a>
              <div>
                <a><img src="https://3c3tsp.sharepoint.com/sites/demosite/siteone/karthiassessment/SiteAssets/DataTable/image/profile.svg" alt="profile" className="profile" /></a>
              </div>
            </header>
          </div> */}

          <div className="dashboard-report">
            <div className="bread-crums-part-btn-ctrols">
              <div className="ViewReport clearfix">
                <div className="view_rfp_header">
                  <h2 className="heading" id="heading_dashboard">DASHBOARD</h2>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard_table_wrap">
            <div className="dataTables_wrapper">
              <div className="dataTables_length clearfix">
                <div className="dataTables_filter">
                  <label className='datatable-label'>
                    <img src="https://3c3tsp.sharepoint.com/sites/demosite/siteone/karthiassessment/SiteAssets/DataTable/image/search-solid.svg" alt="search" />
                    <input
                      type="text"
                      placeholder="Search all columns..."
                      value={globalFilter}
                      onChange={(e) => this.handleGlobalFilter(e.target.value)}
                    />
                  </label>
                 
              
                </div>
               
                
                <div className="dataTables_export">
                  <div>
                <label>Select items per page:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => this.handleItemsPerPageChange(parseInt(e.target.value))}
                  >
                    {itemsPerPageOptions.map(option => (
                      <option key={option} value={option}>
                        {option === -1 ? 'All' : option}
                      </option>
                    ))}
                  </select>
                  </div>
                  <button>
                    <img   onClick={this.exportToExcel} src="https://3c3tsp.sharepoint.com/sites/demosite/siteone/karthiassessment/SiteAssets/DataTable/image/excel.svg" alt="export" />
                 <span>
                 Export
                 </span>
                  </button> 
                </div>
           
                 
              </div>

              <div className="table-dashboard table-responsive">
                <table className="dash_dataTable">
                  <thead>
                    <tr>
                      {columnHeaders.map((header) => (
                        <th key={header}>
                          <div className="header-content">
                            <ul>
                              <li onClick={() => this.handleSort(header)}>
                              {this.getSortButtonText(header)}
                              </li>
                              <li onClick={() => this.toggleColumnDropdown(header)}>
                              {header}
                            </li>                            </ul>
                           

                      

                           
                          </div>
                        </th>
                      
                      ))}  </tr>
                      <tr>

                      {/* <th>  */}
                      {columnHeaders.map((header) => (
  <th key={header} className="filter">
    <div className='search-tabledata'>
      <input
        type="text"
        placeholder={`Search ${header}...`}
        value={this.getColumnFilterText(header)}
        onChange={(e) => this.handleColumnSearch(header, e.target.value)}
      />
      <i className="arrow down"></i>
    </div>

    {/* Render multichoice only if there are suggestions */}
       {columnDropdownVisible[header] && columnSuggestions[header] && columnSuggestions[header].length > 0 && (
                      <div className="multichoice">
                        {columnSuggestions[header].map((value, index) => (
                          <div key={index}>
                            <label>
                              <input
                                type="checkbox"
                                checked={(columnFilters[header] || []).includes(value)}
                                onChange={() => this.handleSuggestionSelect(header, value)}
                              />
                              {value}
                            </label>
                          </div>
                        ))}
                      </div>
    )}
  </th>
))}

                            {/* </th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell: any, cellIndex: any) => (
                          <td key={cellIndex} style={{ textAlign: columnAlignments[columnHeaders[cellIndex]] }}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="dataTable-pagination clearfix">
                <div className="dataTable-pagination-entry">
                <ul className="pagination" >
                  
                  {/* Pagination controls */}
                  <div>
                           <button onClick={() => this.handlePageChange(1)} disabled={currentPage === 1}>
                             First
                           </button>
                           <button onClick={() => this.handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                             Previous
                           </button>
                           <span>
                             Page {currentPage} of {totalPages}
                           </span>
                           <button onClick={() => this.handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                             Next
                           </button>
                           <button onClick={() => this.handlePageChange(totalPages)} disabled={currentPage === totalPages}>
                             Last
                           </button>
                         </div>
                 
                 </ul>
                </div>
              </div>
            </div>
          </div>
        </div>


    </div>







        
      
        <br />
        <br/>
       
    
       
      </div>
     </div>
    );
  }
}

export default DataTable;
