const supabaseEnvRegex = /^SUPABASE_/i;
const envVarPlugin = {
  name: 'env-var-plugin',
  setup(build) {
    const options = build.initialOptions;
    const envVars = {};
    for (const key in process.env) {
      if (supabaseEnvRegex.test(key)) {
        envVars[key] = process.env[key];
      }
    }
    options.define['process.env'] = JSON.stringify(envVars);
    console.log(envVars);
  },
};

export default envVarPlugin;
