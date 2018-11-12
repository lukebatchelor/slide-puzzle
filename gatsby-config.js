module.exports = {
  siteMetadata: {
    title: 'Slide Puzzle',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'Slide Puzzle',
        short_name: 'Slide Puzzle',
        start_url: '/',
        background_color: '#f1f1f1',
        theme_color: '#ffffff',
        display: 'standalone',
        icon: 'src/images/profile.jpg', // This path is relative to the root of the site.
      },
    },
    'gatsby-plugin-offline',
  ],
};
