
// import * as React from 'react';
// import DataTable from './DataTable';
// import { IHelloWorldProps } from './IHelloWorldProps';
// import { SPComponentLoader } from '@microsoft/sp-loader';
// import { Web } from '@pnp/sp/presets/all';



// const DEFAULT_ITEMS_PER_PAGE = 6;
// const ITEMS_PER_PAGE_OPTIONS = [5, 15, 25, 50, -1];

// class HelloWorld extends React.Component<IHelloWorldProps> {
//   state = {
//     data: [],
//     loading: true,
//     columnHeaders: [] as any[],
//   };


//   async componentDidMount() {
//     try {
//       await SPComponentLoader.loadCss("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");
//       await SPComponentLoader.loadCss("https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js");
//       await SPComponentLoader.loadCss("https://3c3tsp.sharepoint.com/sites/demosite/siteone/karthiassessment/SiteAssets/DataTable/css/style.css");
//       await SPComponentLoader.loadCss("https://3c3tsp.sharepoint.com/sites/demosite/siteone/karthiassessment/SiteAssets/DataTable/Css/media.css");
//       await SPComponentLoader.loadScript("https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js");
//       await SPComponentLoader.loadScript("https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js");

//       await this.loadData();
//     } catch (error) {
//       console.error("Error loading scripts or styles", error);
//     }
//   }

//   loadData = async () => {
//     try {
//       const NewWeb = Web("https://3c3tsp.sharepoint.com/sites/demosite/siteone/karthiassessment/");
//       const list = NewWeb.lists.getByTitle("post");
      
//       const columnHeaders = ['Title', 'number', 'Date','ID','Choice'];
//       const items: any[] = await list.items.select(columnHeaders.join(',')).get();

//     //  const fields: any[] = await list.fields.select('Title', 'number', 'Date').get();
//     //   const columnHeaders = fields.map(field => field.Title); 
      
      
     
//       const data = items.map(item => columnHeaders.map(header => item[header]));

//       this.setState({ data, columnHeaders, loading: false });
//     } catch (error) {
//       console.error("Error fetching data", error);
//     }
//   };
  

//   render() {
//     const { data, loading,columnHeaders } = this.state;
//     return (
//       <div>
//         {loading ? (
//           <div style={{alignItems:'center',alignContent:'center',paddingLeft:'600px',paddingTop:'200px'}}>
//           <img style={{height:'150px',width:'150px'}} src="https://3c3tsp.sharepoint.com/sites/demosite/siteone/karthiassessment/SiteAssets/DataTable/image/loading.gif"/>
//           </div>
//         ) : (
//           <DataTable
//             columnHeaders={columnHeaders}
//             itemsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
//             defaultItemsPerPage={DEFAULT_ITEMS_PER_PAGE}
//             data={data}
//           />
//         )}
//       </div>
//     );
//   }
// }

// export default HelloWorld;

import * as React from 'react';
import DataTable from './DataTable';
import { IHelloWorldProps } from './IHelloWorldProps';
import { SPComponentLoader } from '@microsoft/sp-loader';
import { Web } from '@pnp/sp/presets/all';



const DEFAULT_ITEMS_PER_PAGE = 6;
const ITEMS_PER_PAGE_OPTIONS = [5, 15, 25, 50, -1];

class HelloWorld extends React.Component<IHelloWorldProps> {
  state = {
    data: [] as any,
    loading: true,
    columnHeaders: [] as any[],
  };


  async componentDidMount() {
    try {
      await SPComponentLoader.loadCss("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");
      await SPComponentLoader.loadCss("https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js");
      await SPComponentLoader.loadCss("https://3c3tsp.sharepoint.com/sites/demosite/siteone/karthiassessment/SiteAssets/DataTable/css/style.css");
      await SPComponentLoader.loadCss("https://3c3tsp.sharepoint.com/sites/demosite/siteone/karthiassessment/SiteAssets/DataTable/Css/media.css");
      await SPComponentLoader.loadScript("https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js");
      await SPComponentLoader.loadScript("https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js");

      await this.loadData();
    } catch (error) {
      console.error("Error loading scripts or styles", error);
    }
  }

  loadData = async () => {
    try {
      const NewWeb = Web("https://3c3tsp.sharepoint.com/sites/demosite/siteone/karthiassessment/");
      const list = NewWeb.lists.getByTitle("post");
      
      const columnHeaders = ['Title', 'number', 'Date','ID','Choice',];
      const items: any[] = await list.items.select(columnHeaders.join(',')).get();

    //  const fields: any[] = await list.fields.select('Title', 'number', 'Date').get();
    //   const columnHeaders = fields.map(field => field.Title); 
      
      
     
      const data = items.map(item => columnHeaders.map(header => item[header]));

      this.setState({ data, columnHeaders, loading: false });
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };
  

  render() {
    const { data, loading,columnHeaders } = this.state;
    return (
      <div>
        {loading ? (
          <div style={{alignItems:'center',alignContent:'center',paddingLeft:'600px',paddingTop:'200px'}}>
          <img style={{height:'150px',width:'150px'}} src="https://3c3tsp.sharepoint.com/sites/demosite/siteone/karthiassessment/SiteAssets/DataTable/image/loading.gif"/>
          </div>
        ) : (
          <DataTable
            columnHeaders={columnHeaders}
            itemsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
            defaultItemsPerPage={DEFAULT_ITEMS_PER_PAGE}
            data={data}
          />
        )}
      </div>
    );
  }
}

export default HelloWorld;
