
<?php
/**
 * Plugin Name: Farm React Test
 * Description: React calculator deployment test.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

function farm_react_shortcode() {
    $js_files = glob(plugin_dir_path(__FILE__) . 'assets/index-*.js');
    $css_files = glob(plugin_dir_path(__FILE__) . 'assets/index-*.css');

    if (empty($js_files)) {
        return '<p>React build not found.</p>';
    }

    if (!empty($css_files)) {
        wp_enqueue_style(
            'farm-react-style',
            plugins_url('assets/' . basename($css_files[0]), __FILE__)
        );
    }

    wp_enqueue_script(
        'farm-react-app',
        plugins_url('assets/' . basename($js_files[0]), __FILE__),
                      array(),
                      '1.0.0',
                      true
    );

    return '<div id="farm-calculator-root"></div>';
}

add_shortcode('farm_calculator', 'farm_react_shortcode');

add_filter('script_loader_tag', function($tag, $handle) {
    if ($handle === 'farm-react-app') {
        $tag = str_replace('<script ', '<script type="module" ', $tag);
    }
    return $tag;
}, 10, 2);
//
