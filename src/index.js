import { key } from '../AUTH.json';

const URL = `https://us-central1-maclic-b4e9d.cloudfunctions.net/getScreensAnalytics?key=${key}`;
const cc = DataStudioApp.createCommunityConnector();

const getAuthType = () => {
  const AuthTypes = cc.AuthType;
  return cc
    .newAuthTypeResponse()
    .setAuthType(AuthTypes.NONE)
    .build();
};

const getConfig = () => {
  const config = cc.getConfig();

  config
    .newInfo()
    .setId('instructions')
    .setText('Debe indicar el ID del lugar del cual desea mostrar información en el reporte.');

  config
    .newTextInput()
    .setId('placeid')
    .setName('Indique el ID del lugar')
    .setHelpText('Ejemplo: 24h3kj4hjghg43hg4gg')
    .setAllowOverride(true);

  config.setDateRangeRequired(false);

  return config.build();
};

const getSchema = () => {
  const fields = cc.getFields();
  const types = cc.FieldType;

  const title = fields
    .newDimension()
    .setId('title')
    .setName('Título')
    .setDescription('Título de la pantalla')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('type')
    .setName('Tipo')
    .setDescription('Tipo de pantalla')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('place')
    .setName('Lugar')
    .setDescription('Lugar de la pantalla')
    .setType(types.TEXT);

  const amount = fields
    .newMetric()
    .setId('amount')
    .setName('Cantidad')
    .setDescription('Cantidad de registros')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('users')
    .setName('Usuarios')
    .setDescription('Cantidad de usuarios')
    .setType(types.NUMBER);

  fields.setDefaultMetric(amount.getId());
  fields.setDefaultDimension(title.getId());

  return { schema: fields.build() };
};

const fetchDataFromApi = () => {
  return UrlFetchApp.fetch(URL);
};

const normalizeResponse = (request, responseString) => {
  const response = JSON.parse(responseString);
  const { placeId } = request.configParams;
  return response.filter(item => item.id === placeId);
};

const getFormattedData = (response, requestedFields) => {
  console.log(requestedFields);
  return response;
};

const getData = request => {
  const requestedFields = cc.getFields().forIds(
    request.fields.map(field => {
      return field.name;
    })
  );

  let data = [];

  try {
    const apiResponse = fetchDataFromApi();
    const filteredResponse = normalizeResponse(request, apiResponse);
    data = getFormattedData(filteredResponse, requestedFields);
  } catch (e) {
    cc.newUserError()
      .setDebugText(`Error fetching data from API. Exception details: ${e}`)
      .setText(
        'The connector has encountered an unrecoverable error. Please try again later, or file an issue if this error persists.'
      )
      .throwException();
  }

  return {
    schema: requestedFields.build(),
    rows: data
  };
};

global.getAuthType = getAuthType;
global.getConfig = getConfig;
global.getSchema = getSchema;
global.getData = getData;
